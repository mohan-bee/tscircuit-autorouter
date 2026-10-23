import json
import math
from pathlib import Path

root=Path(__file__).resolve().parent
d=json.loads((root/'board.circuit.json').read_text())
srj=json.loads((root/'input.simple-route.json').read_text())
by={x[x['type']+'_id']:x for x in d if x['type']+'_id' in x}

def segments(trace):
    route=trace['route']
    for i,(a,b) in enumerate(zip(route,route[1:])):
        if a['route_type']=='wire' and b['route_type']=='wire' and a['layer']==b['layer']:
            yield i,a,b

def cross(a,b):
    return a[0]*b[1]-a[1]*b[0]

def intersection(a,b,c,d):
    u=(b['x']-a['x'],b['y']-a['y'])
    v=(d['x']-c['x'],d['y']-c['y'])
    den=cross(u,v)
    if abs(den)<1e-12:
        return None
    w=(c['x']-a['x'],c['y']-a['y'])
    t=cross(w,v)/den
    s=cross(w,u)/den
    if 0<=t<=1 and 0<=s<=1:
        return {'x':a['x']+t*u[0],'y':a['y']+t*u[1]}
    return None

out={}
v3,v12=by['pcb_via_3'],by['pcb_via_12']
dist=math.hypot(v3['x']-v12['x'],v3['y']-v12['y'])
out['foreign_net_via_pair']={'ids':['pcb_via_3','pcb_via_12'], 'center_distance_mm':dist,
                            'copper_edge_gap_mm':dist-(v3['outer_diameter']+v12['outer_diameter'])/2}
assert out['foreign_net_via_pair']['copper_edge_gap_mm']<-.12
v=by['pcb_via_5']
out['via5_pad_conflicts']=[]
for pid in ['pcb_smtpad_49','pcb_smtpad_50']:
    p=by[pid]
    dx=max(abs(v['x']-p['x'])-p['width']/2,0)
    dy=max(abs(v['y']-p['y'])-p['height']/2,0)
    edge=math.hypot(dx,dy)-v['outer_diameter']/2
    obstacle=next(o for o in srj['obstacles'] if o.get('circuitJsonMetadata',{}).get('pcb_smtpad_id')==pid)
    out['via5_pad_conflicts'].append({'pad_id':pid,'via_center':{'x':v['x'],'y':v['y']},
        'pad_center':{'x':p['x'],'y':p['y']},'pad_width':p['width'],'pad_height':p['height'],
        'copper_edge_gap_mm':edge,'input_geometry_matches':
        obstacle['center']=={'x':p['x'],'y':p['y']} and obstacle['width']==p['width'] and obstacle['height']==p['height'],
        'input_obstacle_has_foreign_net33': 'source_net_33' in obstacle['connectedTo']})
    assert edge<0 and not ('source_net_33' in obstacle['connectedTo'])
out['trace_centerline_crossings']=[]
for aid,bid in [('source_net_34_0','source_net_31_0'),('source_net_34_0','source_net_24_0'),
                ('source_net_31_0','source_net_30_0')]:
    a,b=by[aid],by[bid]
    found=False
    for ai,aa,ab in segments(a):
        for bi,ba,bb in segments(b):
            if aa['layer']!=ba['layer']:
                continue
            p=intersection(aa,ab,ba,bb)
            if p:
                out['trace_centerline_crossings'].append({'trace_ids':[aid,bid], 'segment_indices':[ai,bi],
                    'layer':aa['layer'], 'crossing':p, 'segment_A':[aa,ab], 'segment_B':[ba,bb]})
                found=True
                break
        if found:
            break
assert len(out['trace_centerline_crossings'])>=2
out['via_sizes']={str((x['outer_diameter'],x['hole_diameter'])) for x in d if x['type']=='pcb_via'}
out['via_sizes']=sorted(out['via_sizes'])
out['wire_widths']=sorted({p['width'] for x in d if x['type']=='pcb_trace' for p in x['route'] if p['route_type']=='wire'})
out['captured_input_via_pad_drill_mm']=[srj['minViaPadDiameter'],srj['minViaHoleDiameter']]
out['board_edge_violations']=[]
for x in d:
    if x['type']!='pcb_trace':
        continue
    for i,p in enumerate(x['route']):
        if p['route_type']!='wire':
            continue
        c=min(p['x']-srj['bounds']['minX'],srj['bounds']['maxX']-p['x'],
              p['y']-srj['bounds']['minY'],srj['bounds']['maxY']-p['y'])-p['width']/2
        if c<srj['minBoardEdgeClearance']-1e-6:
            out['board_edge_violations'].append({'trace_id':x['pcb_trace_id'],'point_index':i,
                'x':p['x'],'y':p['y'],'copper_edge_to_board_mm':c})
(Path(__file__).with_name('independent-geometry-audit.json')).write_text(json.dumps(out,indent=2))
print(json.dumps({k:v for k,v in out.items() if k not in ['board_edge_violations','trace_centerline_crossings']},indent=2))
print('Centerline crossing witnesses:',[(x['trace_ids'],x['layer'],x['crossing']) for x in out['trace_centerline_crossings']])
print('Board-edge violation points:',len(out['board_edge_violations']))


const $=s=>document.querySelector(s);
let timer;function toast(t){$('#toast').textContent=t;$('#toast').classList.add('show');clearTimeout(timer);timer=setTimeout(()=>$('#toast').classList.remove('show'),2200)}
const defaults={fairy:80,desk:45,color:'warm',preset:'unwind',period:0,zoom:1,top:false,bloom:true};let state={...defaults};
const presets={focus:{fairy:25,desk:100,color:'cool',period:0},unwind:{fairy:80,desk:45,color:'warm',period:0},sleep:{fairy:10,desk:0,color:'warm',period:2}};
try{const v=JSON.parse(localStorage.getItem('jia-room-v2-personal'));if(v){for(const k of ['fairy','desk'])if(Number.isFinite(v[k]))state[k]=Math.max(0,Math.min(100,v[k]));if(['focus','unwind','sleep','custom'].includes(v.preset))state.preset=v.preset;if(['warm','cool','rose'].includes(v.color))state.color=v.color;if([0,1,2].includes(v.period))state.period=v.period}}catch{}
let update3D=()=>{},homeView=()=>{},setTop=()=>{},zoomView=()=>{};
function sync(){for(const k of ['fairy','desk']){$('#'+k).value=state[k];$('#'+k).style.setProperty('--fill',state[k]+'%');$('#'+k+'Value').textContent=state[k]+'%'}$('#master').setAttribute('aria-checked',String(state.fairy>0||state.desk>0));document.querySelectorAll('[data-preset]').forEach(e=>e.setAttribute('aria-pressed',String(e.dataset.preset===state.preset)));update3D();try{localStorage.setItem('jia-room-v2-personal',JSON.stringify(state))}catch{}}
function toggleLight(k){state[k]=state[k]?0:80;state.preset='custom';sync();toast((k==='desk'?'Desk lamp':'Fairy lights')+(state[k]?' on':' off'))}
for(const k of ['fairy','desk'])$('#'+k).oninput=e=>{state[k]=+e.target.value;state.preset='custom';sync()};
$('#master').onclick=()=>{const on=state.fairy||state.desk;state.fairy=on?0:80;state.desk=on?0:45;state.preset='custom';sync()};
document.querySelectorAll('[data-preset]').forEach(e=>e.onclick=()=>{Object.assign(state,presets[e.dataset.preset],{preset:e.dataset.preset});sync();toast(e.textContent.trim()+' ritual')});
$('#home').onclick=()=>{state.top=false;homeView();sync()};$('#iso').onclick=()=>{state.top=false;homeView();sync()};$('#top').onclick=()=>{state.top=true;setTop();sync()};$('#in').onclick=()=>zoomView(.84);$('#out').onclick=()=>zoomView(1.19);
function tab(name){const panel=$('#settingsPanel');const already=panel.dataset.active===name&&!panel.hidden;panel.hidden=already;panel.dataset.active=already?'':name;for(const n of ['lighting','rituals']){$('#'+n+'Tab').setAttribute('aria-expanded',String(!already&&n===name));$('#'+n+'Panel').hidden=n!==name}}
$('#lightingTab').onclick=()=>tab('lighting');$('#ritualsTab').onclick=()=>tab('rituals');$('#closePanel').onclick=()=>{$('#settingsPanel').hidden=true;for(const n of ['lighting','rituals'])$('#'+n+'Tab').setAttribute('aria-expanded','false')};
document.addEventListener('keydown',e=>{if(e.key==='Escape')$('#closePanel').click()});
sync();
try {
 const [THREE,{OrbitControls}]=await Promise.all([import('three'),import('three/addons/controls/OrbitControls.js')]);
 const viewport=$('#viewport');
 const renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,powerPreference:'high-performance'});
 renderer.setPixelRatio(Math.min(devicePixelRatio||1,2));renderer.setClearColor(0x000000,0);renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.1;renderer.outputColorSpace=THREE.SRGBColorSpace;viewport.appendChild(renderer.domElement);
 renderer.domElement.setAttribute('aria-label','3D room. Drag to rotate, scroll to zoom, right-drag to pan.');renderer.domElement.setAttribute('tabindex','0');
 const scene=new THREE.Scene(),room=new THREE.Group();scene.add(room);
 const camera=new THREE.PerspectiveCamera(32,1,.1,100);camera.position.set(-7.4,6.5,12.0);
 const controls=new OrbitControls(camera,renderer.domElement);controls.target.set(0,.8,0);controls.enableDamping=true;controls.dampingFactor=.065;controls.minDistance=5;controls.maxDistance=22;controls.minPolarAngle=.03;controls.maxPolarAngle=Math.PI*.485;controls.autoRotateSpeed=.55;controls.screenSpacePanning=true;controls.zoomToCursor=true;
 controls.addEventListener('start',()=>{controls.autoRotate=false;$('#spin').setAttribute('aria-pressed','false')});
 controls.addEventListener('change',()=>{if(state.top&&controls.getPolarAngle()>.09){state.top=false;sync()}});
 const mat=(color,extra={})=>new THREE.MeshStandardMaterial({color,roughness:.74,...extra});
 const texture=(kind)=>{const c=document.createElement('canvas');c.width=c.height=256;const g=c.getContext('2d');g.fillStyle=kind==='wood'?'#dfbd8c':'#c6bdab';g.fillRect(0,0,256,256);for(let i=0;i<700;i++){const n=Math.sin(i*127.1)*43758.5453,rand=n-Math.floor(n);g.strokeStyle=kind==='wood'?`rgba(130,92,48,${.02+rand*.05})`:`rgba(255,255,255,${.02+rand*.08})`;g.lineWidth=.5;g.beginPath();if(kind==='wood'){const y=rand*256;g.moveTo(0,y);g.bezierCurveTo(80,y+Math.sin(i)*5,180,y-3,256,y)}else{const x=rand*256,y=((i*43)%256);g.moveTo(x,y);g.lineTo(x+4,y+2)}g.stroke()}const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(kind==='wood'?1:5,kind==='wood'?1:5);t.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());return t};
 const wood=mat('#f0d2a4',{map:texture('wood')}),edge=mat('#d3b07b'),cream=mat('#faf7ed'),white=mat('#fffdf7'),purple=mat('#b49acb'),dark=mat('#35424a'),metal=mat('#cbd9e0',{metalness:.5,roughness:.35}),pink=mat('#edb4bb'),bagmat=mat('#d7c5a0');
 const mesh=(geo,material,x,y,z,parent=room)=>{const o=new THREE.Mesh(geo,material);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;parent.add(o);return o};
 const box=(w,h,d,x,y,z,m=wood,parent=room)=>mesh(new THREE.BoxGeometry(w,h,d),m,x,y,z,parent);
 function rounded(w,h,d,x,y,z,m,parent=room,r=.06){r=Math.min(r,w*.45,h*.45,d*.45);const s=new THREE.Shape(),a=-w/2,b=-h/2;s.moveTo(a+r,b);s.lineTo(a+w-r,b);s.quadraticCurveTo(a+w,b,a+w,b+r);s.lineTo(a+w,b+h-r);s.quadraticCurveTo(a+w,b+h,a+w-r,b+h);s.lineTo(a+r,b+h);s.quadraticCurveTo(a,b+h,a,b+h-r);s.lineTo(a,b+r);s.quadraticCurveTo(a,b,a+r,b);const geo=new THREE.ExtrudeGeometry(s,{depth:d-2*r,steps:1,bevelEnabled:true,bevelThickness:r,bevelSize:r,bevelSegments:3,curveSegments:5});geo.translate(0,0,-(d-2*r)/2);return mesh(geo,m,x,y,z,parent)}
 const ball=(x,y,z,sx,sy,sz,m,parent=room)=>{const o=mesh(new THREE.SphereGeometry(1,24,16),m,x,y,z,parent);o.scale.set(sx,sy,sz);return o};
 const cylinder=(r1,r2,h,x,y,z,m,parent=room)=>mesh(new THREE.CylinderGeometry(r1,r2,h,24),m,x,y,z,parent);
 function rod(a,b,r,m,parent=room){const A=new THREE.Vector3(...a),B=new THREE.Vector3(...b),o=cylinder(r,r,A.distanceTo(B),...A.clone().add(B).multiplyScalar(.5).toArray(),m,parent);o.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),B.sub(A).normalize());return o}
 function curve(points,m,r=.009,parent=room){const path=new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p)));return mesh(new THREE.TubeGeometry(path,40,r,6,false),m,0,0,0,parent)}
 const ground=mesh(new THREE.PlaneGeometry(60,60),new THREE.ShadowMaterial({opacity:.16}),0,-.205,0,scene);ground.rotation.x=-Math.PI/2;ground.castShadow=false;
 const floor=box(6,.18,5.7,0,-.1,0,mat('#bdd4e4'));floor.receiveShadow=true;
 box(5.85,.04,5.55,0,.01,0,mat('#ddd0b9',{map:texture('carpet')}));
 const rear=new THREE.Group(),right=new THREE.Group();room.add(rear,right);
 // Window opening is built into the back wall rather than painted over it.
 const wall=mat('#f4efdf');
 box(6,1.18,.13,0,.59,-2.79,wall,rear);box(6,.48,.13,0,2.83,-2.79,wall,rear);
 box(.74,1.4,.13,-2.63,1.88,-2.79,wall,rear);box(3.34,1.4,.13,1.33,1.88,-2.79,wall,rear);
 box(.13,3.07,5.7,2.94,1.535,0,wall,right);
 box(6,.1,.14,0,.085,-2.69,edge,rear);box(.14,.1,5.65,2.84,.085,0,edge,right);
 // Tall window and sill above the desk.
 const glass=mat('#8fb5d2',{roughness:.2,metalness:.12,emissive:'#9cc8e9',emissiveIntensity:.16});
 box(1.92,1.42,.045,-1.3,1.89,-2.8,glass,rear);
 [-2.27,-1.3,-.33].forEach(x=>box(.045,1.48,.09,x,1.88,-2.73,mat('#a5b4b9'),rear));
 [1.16,2.6].forEach(y=>box(2.02,.055,.1,-1.3,y,-2.73,cream,rear));box(2.13,.065,.25,-1.3,1.14,-2.65,white,rear);
 // Sliding closet on the right, beside the dresser.
 const closet=new THREE.Group();closet.position.z=1.65;right.add(closet);box(.06,2.48,1.46,2.84,1.24,-1.13,cream,closet);
 [-1.49,-.77].forEach(z=>{box(.045,2.36,.69,2.795,1.23,z,white,closet);box(.025,.16,.028,2.75,1.12,z+.25,dark,closet)});box(.09,.045,1.55,2.79,2.47,-1.13,metal,closet);
 const contactCanvas=document.createElement('canvas');contactCanvas.width=contactCanvas.height=128;const cg=contactCanvas.getContext('2d'),gradient=cg.createRadialGradient(64,64,10,64,64,64);gradient.addColorStop(0,'rgba(67,58,45,.30)');gradient.addColorStop(.6,'rgba(67,58,45,.13)');gradient.addColorStop(1,'rgba(67,58,45,0)');cg.fillStyle=gradient;cg.fillRect(0,0,128,128);const contactTexture=new THREE.CanvasTexture(contactCanvas);
 function contact(x,z,w,d){const o=mesh(new THREE.PlaneGeometry(w,d),new THREE.MeshBasicMaterial({map:contactTexture,transparent:true,depthWrite:false,opacity:.65}),x,.037,z);o.rotation.x=-Math.PI/2;o.castShadow=false;o.receiveShadow=false}
 contact(-1.94,.77,1.8,3.7);contact(-1.1,-2.21,2.7,1.4);contact(2.45,-1.55,1.2,1.6);contact(-1.03,-1.11,1.1,1.1);
 // Twin bed along the open left edge: head near desk, foot toward viewer.
 const bx=-1.94,bz=.77;
 box(1.38,.13,3.15,bx,.32,bz);[-2.55,-1.33].forEach(x=>[-.78,2.32].forEach(z=>box(.075,.92,.075,x,.46,z)));
 [-.78,2.32].forEach(z=>{box(1.3,.13,.065,bx,.77,z);box(1.3,.09,.065,bx,.46,z)});
 rounded(1.25,.25,3.0,bx,.51,bz,white);rounded(1.26,.095,2.91,bx,.665,bz,white);
 const pillow=ball(bx,.77,-.37,.49,.13,.3,white);pillow.rotation.y=-.06;
 // A subdivided purple cloth surface with visible folds and a soft hanging side.
 const clothGeo=new THREE.PlaneGeometry(1.34,1.9,42,56),positions=clothGeo.attributes.position;
 for(let i=0;i<positions.count;i++){const u=positions.getX(i),v=positions.getY(i);const ripple=.035*Math.sin(v*23+u*7)+.026*Math.sin(u*33-v*9);const bunch=.08*Math.exp(-Math.pow(v-.45,2)*7)*Math.sin(u*13)**2;positions.setXYZ(i,u,.84+ripple+bunch,1.03-v)}
 clothGeo.computeVertexNormals();const cloth=mesh(clothGeo,purple,bx,0,0);cloth.material.side=THREE.DoubleSide;
 const hanging=new THREE.PlaneGeometry(.28,1.9,12,45),hp=hanging.attributes.position;
 for(let i=0;i<hp.count;i++){let u=hp.getX(i),v=hp.getY(i);hp.setXYZ(i,bx-.67-.05*Math.sin((u+.14)*5),.72-(u+.14)*1.1+.018*Math.sin(v*22),1.03-v)}hanging.computeVertexNormals();mesh(hanging,purple,0,0,0);
 // Desk below the window.
 const dx=-1.1,dz=-2.21;
 rounded(2.16,.085,.82,dx,.86,dz,wood);box(.075,.8,.71,-2.1,.42,dz);box(.6,.79,.72,-.34,.43,dz);
 for(let i=0;i<3;i++){rounded(.56,.222,.025,-.34,.19+i*.235,-1.832,wood);box(.17,.025,.018,-.34,.27+i*.235,-1.808,dark)}
 // Laptop stand, screen, keyboard, tablet.
 rod([-1.27,.9,-2.18],[-1.27,1.09,-2.28],.022,metal);rounded(.57,.025,.39,-1.27,1.07,-2.17,metal);
 const screen=rounded(.59,.38,.026,-1.27,1.29,-2.34,metal);screen.rotation.x=-.19;
 
 const screenFace=box(.535,.315,.006,-1.27,1.29,-2.321,mat('#a9c7d8',{emissive:'#b5d9e8',emissiveIntensity:.15}));screenFace.rotation.x=-.19;
 rounded(.62,.025,.22,-1.25,.926,-1.94,white);
 for(let r=0;r<3;r++)for(let c=0;c<10;c++)box(.042,.006,.037,-1.5+c*.052,.943,-2.01+r*.052,mat('#d2dbe1'));
 rod([-1.93,.91,-2.19],[-1.93,1.1,-2.3],.012,cream);const tablet=rounded(.23,.38,.025,-1.93,1.29,-2.28,mat('#d3d7bb'));tablet.rotation.x=-.15;
 // Framed postcards on the window sill.
 function postcard(x,z,color){rounded(.22,.28,.025,x,1.31,z,white,rear);const c=document.createElement('canvas');c.width=100;c.height=140;const g=c.getContext('2d');g.fillStyle='#f8f3df';g.fillRect(0,0,100,140);g.fillStyle=color;g.beginPath();g.moveTo(0,115);g.lineTo(28,45);g.lineTo(47,87);g.lineTo(68,25);g.lineTo(100,115);g.fill();g.strokeStyle='#5a8d8c';g.lineWidth=3;g.beginPath();g.moveTo(50,130);g.lineTo(46,55);g.stroke();const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;box(.185,.24,.004,x,1.31,z+.015,mat('#ffffff',{map:t}),rear)}
 postcard(-.85,-2.58,'#78aabb');postcard(-.54,-2.58,'#c9b977');
 // Real task lamp and headphones.
 const lampGroup=new THREE.Group();room.add(lampGroup);lampGroup.userData.action='desk';
 cylinder(.095,.12,.025,-.52,.925,-2.34,cream,lampGroup);rod([-.52,.93,-2.34],[-.52,1.62,-2.34],.018,cream,lampGroup);rounded(.49,.035,.055,-.72,1.62,-2.34,cream,lampGroup);
 const lampEmitter=mat('#fff3c1',{emissive:'#ffdda0',emissiveIntensity:1});box(.44,.008,.04,-.72,1.595,-2.34,lampEmitter,lampGroup);
 curve([[-.52,1.57,-2.25],[-.38,1.55,-2.21],[-.35,1.36,-2.2]],bagmat,.018);
 ball(-.35,1.32,-2.2,.055,.08,.043,cream);ball(-.55,1.32,-2.2,.055,.08,.043,cream);
 rounded(.21,.15,.15,-.16,.98,-2.37,mat('#d7ad9b'));const tissue=box(.11,.17,.008,-.16,1.12,-2.37,white);tissue.rotation.z=.2;
 cylinder(.055,.045,.16,-.12,.985,-1.99,mat('#bad2e0',{transparent:true,opacity:.65,roughness:.15}));
 // Black slatted rolling chair in front of desk.
 const chair=new THREE.Group();chair.position.set(-1.03,0,-1.11);chair.rotation.y=-.12;room.add(chair);
 rod([0,.15,0],[0,.51,0],.037,dark,chair);for(let i=0;i<5;i++){const a=i*Math.PI*2/5;rod([0,.17,0],[Math.cos(a)*.32,.09,Math.sin(a)*.32],.018,dark,chair);const wheel=cylinder(.043,.043,.045,Math.cos(a)*.32,.07,Math.sin(a)*.32,dark,chair);wheel.rotation.z=Math.PI/2}
 rounded(.53,.08,.5,0,.55,0,dark,chair);rod([-.21,.57,.18],[-.21,1.07,.27],.022,dark,chair);rod([.21,.57,.18],[.21,1.07,.27],.022,dark,chair);
 for(let i=0;i<7;i++)rounded(.46,.034,.045,0,.68+i*.061,.23+i*.008,dark,chair,.012);
 for(const x of [-.29,.29]){rod([x,.55,.04],[x,.77,.04],.018,dark,chair);rounded(.06,.045,.26,x,.78,-.02,dark,chair)}
 // Dresser on the right wall, before the closet.
 const dresserStart=room.children.length;
 box(1.07,1.14,.7,1.52,.61,-2.27);rounded(1.16,.065,.79,1.52,1.22,-2.27,wood);
 for(let i=0;i<4;i++){rounded(.99,.252,.025,1.52,.22+i*.273,-1.903,wood);box(.22,.029,.018,1.52,.3+i*.273,-1.88,dark)}
 for(const x of [1.08,1.96])for(const z of [-2.55,-1.99])box(.06,.13,.06,x,.075,z);
 // Blue diffuser, mushroom lamp, pink bunny, coral box, cream bag.
 rounded(.23,.17,.2,1.12,1.34,-2.12,mat('#80b7f2'));cylinder(.105,.105,.035,1.12,1.255,-2.12,cream);
 const mushroom=new THREE.Group();mushroom.userData.action='fairy';room.add(mushroom);
 cylinder(.048,.06,.16,1.37,1.32,-2.07,cream,mushroom);const mushroomMat=mat('#fff6d9',{emissive:'#ffe4ac',emissiveIntensity:.7});const cap=mesh(new THREE.SphereGeometry(.12,28,14,0,Math.PI*2,0,Math.PI/2),mushroomMat,1.37,1.4,-2.07,mushroom);cylinder(.12,.12,.02,1.37,1.398,-2.07,mushroomMat,mushroom);
 const bunny=ball(1.49,1.48,-2.42,.18,.22,.12,pink);const ear1=ball(1.4,1.7,-2.42,.055,.12,.045,pink);ear1.rotation.z=.2;const ear2=ball(1.57,1.7,-2.42,.055,.12,.045,pink);ear2.rotation.z=-.15;
 for(const x of [1.43,1.55])ball(x,1.52,-2.305,.014,.017,.012,dark);ball(1.49,1.47,-2.298,.02,.014,.012,mat('#ac747e'));
 for(const x of [1.39,1.59])ball(x,1.46,-2.31,.025,.015,.009,mat('#d58f9b'));
 rounded(.3,.28,.13,1.87,1.41,-2.4,bagmat);curve([[1.76,1.51,-2.4],[1.76,1.83,-2.4],[1.96,1.83,-2.4],[1.98,1.51,-2.4]],bagmat,.012);
 rounded(.25,.07,.14,1.78,1.3,-2.08,mat('#ddac99'));
 // Preserve every accessory while rotating the dresser to face the center.
 const dresserItems=room.children.slice(dresserStart),dresserGroup=new THREE.Group();room.add(dresserGroup);
 dresserItems.forEach(o=>dresserGroup.add(o));dresserGroup.rotation.y=-Math.PI/2;dresserGroup.position.set(.18,0,-3.07);
 // Fairy lights follow both back walls, with emissive bulbs and restrained halos.
 const fairyM=mat('#fff3c2',{emissive:'#ffe1a3',emissiveIntensity:2}),wireM=mat('#b9b09a');const fairyBulbs=[];
 const backWire=[],rightWire=[];for(let i=0;i<=60;i++){const t=i/60;backWire.push([-2.8+5.6*t,2.87-.09*Math.sin(t*Math.PI*4),-2.69]);rightWire.push([2.83,2.87-.08*Math.sin(t*Math.PI*4),-2.64+5.2*t])}
 curve(backWire,wireM,.007,rear);curve(rightWire,wireM,.007,right);
 const haloCanvas=document.createElement('canvas');haloCanvas.width=haloCanvas.height=64;const hg=haloCanvas.getContext('2d'),grad=hg.createRadialGradient(32,32,1,32,32,32);grad.addColorStop(0,'rgba(255,244,206,.75)');grad.addColorStop(.22,'rgba(255,224,168,.2)');grad.addColorStop(1,'rgba(255,224,168,0)');hg.fillStyle=grad;hg.fillRect(0,0,64,64);const haloTexture=new THREE.CanvasTexture(haloCanvas),halos=[];
 function halo(x,y,z,size,parent){const material=new THREE.SpriteMaterial({map:haloTexture,transparent:true,depthWrite:false,opacity:.65,toneMapped:false});const s=new THREE.Sprite(material);s.position.set(x,y,z);s.scale.set(size,size,1);parent.add(s);halos.push(s);return s}
 for(let i=0;i<=24;i++){const j=Math.round(i*60/24);for(const [points,parent]of [[backWire,rear],[rightWire,right]]){const p=points[j];fairyBulbs.push(ball(p[0],p[1]-.025,p[2],.018,.027,.018,fairyM,parent));halo(p[0],p[1]-.025,p[2]+.015,.16,parent)}}
 halo(1.37,1.43,-2.07,.55,mushroom);
 // v2 decor accents: original room objects and placements remain intact.
 const accentGroup=new THREE.Group();accentGroup.name='v2-additional-touches';room.add(accentGroup);
 const stemMat=mat('#75875c'),leafMat=mat('#8b9b6c',{roughness:.92});
 const vineBack=new THREE.Group(),vineSide=new THREE.Group();rear.add(vineBack);right.add(vineSide);
 let decorSeed=547;const decorRandom=()=>{decorSeed=decorSeed*16807%2147483647;return(decorSeed-1)/2147483646};
 const leafGeo=new THREE.SphereGeometry(1,10,7),backLeaves=new THREE.InstancedMesh(leafGeo,leafMat,160),sideLeaves=new THREE.InstancedMesh(leafGeo,leafMat,100);
 backLeaves.castShadow=true;sideLeaves.castShadow=true;vineBack.add(backLeaves);vineSide.add(sideLeaves);let backCount=0,sideCount=0;const decorDummy=new THREE.Object3D();
 function trailingVine(side,start,length,index){const parent=side?vineSide:vineBack,points=[];for(let i=0;i<=14;i++){const t=i/14,a=start+Math.sin(t*4+index)*.026;points.push(side?[2.84,2.94-length*t,a]:[a,2.94-length*t,-2.69])}curve(points,stemMat,.004,parent);
 for(let i=0;i<11;i++){const t=(i+.4)/11,a=start+Math.sin(t*4+index)*.026,flip=i%2?1:-1;decorDummy.position.set(...(side?[2.8,2.94-length*t,a+flip*.025]:[a+flip*.025,2.94-length*t,-2.66]));decorDummy.rotation.set(0,side?-Math.PI/2:0,flip*.6);decorDummy.scale.set(.024+decorRandom()*.01,.053+decorRandom()*.02,.009);decorDummy.updateMatrix();if(side)sideLeaves.setMatrixAt(sideCount++,decorDummy.matrix);else backLeaves.setMatrixAt(backCount++,decorDummy.matrix)}}
 // Leave the actual window, desk, closet, and fairy lights unobstructed.
 [-2.67,.28,.55,.84,1.18,1.52,1.87,2.2,2.53].forEach((x,i)=>trailingVine(false,x,.57+decorRandom()*.65,i));
 [-2.55,-2.33,-2.12,-1.9].forEach((z,i)=>trailingVine(true,z,.6+decorRandom()*.6,i));
 backLeaves.count=backCount;sideLeaves.count=sideCount;backLeaves.instanceMatrix.needsUpdate=true;sideLeaves.instanceMatrix.needsUpdate=true;backLeaves.computeBoundingSphere();sideLeaves.computeBoundingSphere();
 // A small hanging star cluster supplements the real perimeter fairy lights.
 const starsGroup=new THREE.Group();starsGroup.userData.action='fairy';starsGroup.name='star-light-accent';rear.add(starsGroup);
 const accentStarMat=mat('#fff1bb',{emissive:'#ffe5ac',emissiveIntensity:1.5}),starHalos=[];
 function accentStar(x,y,r){const shape=new THREE.Shape();for(let i=0;i<10;i++){const a=Math.PI/2+i*Math.PI/5,R=i%2?r*.47:r;i?shape.lineTo(Math.cos(a)*R,Math.sin(a)*R):shape.moveTo(Math.cos(a)*R,Math.sin(a)*R)}shape.closePath();mesh(new THREE.ExtrudeGeometry(shape,{depth:.023,bevelEnabled:true,bevelThickness:.008,bevelSize:.008,bevelSegments:2,steps:1}),accentStarMat,x,y,-2.51,starsGroup);rod([x,2.97,-2.51],[x,y+r,-2.51],.003,mat('#c9bfa5'),starsGroup);const h=new THREE.Sprite(new THREE.SpriteMaterial({map:haloTexture,transparent:true,depthWrite:false,opacity:.6,toneMapped:false}));h.position.set(x,y,-2.46);h.scale.set(r*4,r*4,1);starsGroup.add(h);starHalos.push(h)}
 accentStar(.62,2.58,.12);accentStar(1.03,2.30,.15);accentStar(1.45,2.65,.11);
 const accentLight=new THREE.PointLight('#ffe4ad',.8,2.6,2);accentLight.position.set(1.03,2.38,-2.34);scene.add(accentLight);
 // A small windowsill plant, placed away from the existing framed postcards.
 cylinder(.055,.045,.085,-1.67,1.225,-2.57,mat('#c4b99a'),rear);cylinder(.046,.046,.006,-1.67,1.27,-2.57,mat('#645a42'),rear);
 for(let i=0;i<5;i++){const a=i*2.4;rod([-1.67,1.27,-2.57],[-1.67+Math.sin(a)*.045,1.38+(i%2)*.035,-2.57+Math.cos(a)*.035],.004,stemMat,rear);const l=ball(-1.67+Math.sin(a)*.05,1.39+(i%2)*.035,-2.57+Math.cos(a)*.04,.025,.055,.01,leafMat,rear);l.rotation.z=Math.sin(a)*.6;l.rotation.y=a}
 // A compact rug warms the open floor without adding replacement furniture.
 const rugCanvas=document.createElement('canvas');rugCanvas.width=rugCanvas.height=256;const rg=rugCanvas.getContext('2d');rg.fillStyle='#ebe3ce';rg.fillRect(0,0,256,256);for(let y=0;y<12;y++)for(let x=0;x<12;x++)if((x+y)%2===0){rg.fillStyle='#ded4bd';rg.fillRect(x*22,y*22,22,22)}const rugTex=new THREE.CanvasTexture(rugCanvas);rugTex.colorSpace=THREE.SRGBColorSpace;
 cylinder(.58,.58,.014,-.15,.044,1.30,mat('#ffffff',{map:rugTex,roughness:1}),accentGroup);

 // Light sources are independent of the decorative bulbs.
 const ambient=new THREE.HemisphereLight('#ecebdc','#b6a58d',2.3);scene.add(ambient);
 const sun=new THREE.DirectionalLight('#fff4dc',3.2);sun.position.set(-3,7,5);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);Object.assign(sun.shadow.camera,{left:-5,right:5,top:5,bottom:-5,near:.5,far:25});sun.shadow.normalBias=.035;sun.shadow.bias=-.0001;sun.shadow.radius=3;scene.add(sun);
 const fill=new THREE.DirectionalLight('#d5e1d4',1.5);fill.position.set(5,5,-3);scene.add(fill);
 const deskLight=new THREE.PointLight('#ffdda0',3,2.7,2);deskLight.position.set(-.72,1.53,-2.26);scene.add(deskLight);
 const mushroomLight=new THREE.PointLight('#ffe1ac',1.5,2.0,2);mushroomLight.position.set(2.19,1.46,-1.70);scene.add(mushroomLight);
 const fairyLights=[];for(const p of [[-1.7,2.6,-2.3],[1.6,2.6,-2.3],[2.6,2.5,.7]]){const light=new THREE.PointLight('#ffe0a3',1.5,3.8,2);light.position.set(...p);scene.add(light);fairyLights.push(light)}
 update3D=()=>{const c={warm:'#ffdda0',cool:'#bbddff',rose:'#ffb9aa'}[state.color];fairyM.emissive.set(c);fairyM.emissiveIntensity=state.fairy/100*2.7;fairyM.color.set(state.fairy?c:'#c9bea9');lampEmitter.emissive.set(c);lampEmitter.emissiveIntensity=state.desk/100*2;mushroomMat.emissive.set(c);mushroomMat.emissiveIntensity=state.fairy/100;deskLight.color.set(c);deskLight.intensity=state.desk/100*3.4;mushroomLight.color.set(c);mushroomLight.intensity=state.fairy/100*1.5;fairyLights.forEach(l=>{l.color.set(c);l.intensity=state.fairy/100*1.3});halos.forEach(h=>{h.visible=state.bloom&&state.fairy>0;h.material.opacity=state.fairy/100*.7;h.material.color.set(c)});accentStarMat.emissive.set(c);accentStarMat.emissiveIntensity=state.fairy/100*2.3;accentLight.color.set(c);accentLight.intensity=state.fairy/100*.95;starHalos.forEach(h=>{h.visible=state.bloom&&state.fairy>0;h.material.opacity=state.fairy/100*.65});const day=[1,.76,.32][state.period];ambient.intensity=.65+day*.85;sun.intensity=.6+day*2.1;fill.intensity=.35+day*.65;glass.emissiveIntensity=day*.18;};
 homeView=()=>{controls.autoRotate=false;$('#spin').setAttribute('aria-pressed','false');controls.target.set(0,.8,0);camera.position.set(-7.4,6.5,12.0);camera.up.set(0,1,0);controls.update()};
 setTop=()=>{controls.autoRotate=false;$('#spin').setAttribute('aria-pressed','false');controls.target.set(0,.25,0);camera.position.set(-.01,15,.01);controls.update()};
 zoomView=factor=>{const offset=camera.position.clone().sub(controls.target);offset.multiplyScalar(factor);offset.setLength(THREE.MathUtils.clamp(offset.length(),controls.minDistance,controls.maxDistance));camera.position.copy(controls.target).add(offset);controls.update()};
 $('#spin').onclick=()=>{if(state.top){state.top=false;homeView();sync()}controls.autoRotate=!controls.autoRotate;$('#spin').setAttribute('aria-pressed',String(controls.autoRotate));toast(controls.autoRotate?'Auto-rotate on':'Auto-rotate off')};
 // Raycasting distinguishes a click from an orbit gesture.
 const raycaster=new THREE.Raycaster(),pointer=new THREE.Vector2();let down=null;
 renderer.domElement.addEventListener('pointerdown',e=>{down={x:e.clientX,y:e.clientY,time:performance.now(),button:e.button}});
 renderer.domElement.addEventListener('pointerup',e=>{if(!down||down.button!==0||Math.hypot(e.clientX-down.x,e.clientY-down.y)>6||performance.now()-down.time>700){down=null;return}down=null;const rect=renderer.domElement.getBoundingClientRect();pointer.set((e.clientX-rect.left)/rect.width*2-1,-(e.clientY-rect.top)/rect.height*2+1);raycaster.setFromCamera(pointer,camera);const hit=raycaster.intersectObjects(room.children,true).find(h=>{let o=h.object;while(o){if(!o.visible)return false;o=o.parent}return true});if(hit){let o=hit.object;while(o&&!o.userData.action)o=o.parent;if(o?.userData.action)toggleLight(o.userData.action)}});
 renderer.domElement.addEventListener('pointercancel',()=>down=null);
 renderer.domElement.addEventListener('keydown',e=>{if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key)){e.preventDefault();controls.autoRotate=false;$('#spin').setAttribute('aria-pressed','false');const offset=camera.position.clone().sub(controls.target),spherical=new THREE.Spherical().setFromVector3(offset);if(e.key==='ArrowLeft')spherical.theta-=.12;if(e.key==='ArrowRight')spherical.theta+=.12;if(e.key==='ArrowUp')spherical.phi-=.1;if(e.key==='ArrowDown')spherical.phi+=.1;spherical.phi=THREE.MathUtils.clamp(spherical.phi,.03,Math.PI*.485);camera.position.copy(controls.target).add(new THREE.Vector3().setFromSpherical(spherical));state.top=false;controls.update();sync()}else if(e.key==='+'||e.key==='='){e.preventDefault();zoomView(.9)}else if(e.key==='-'){e.preventDefault();zoomView(1.1)}});
 const resize=()=>{const rect=viewport.getBoundingClientRect();renderer.setSize(rect.width,rect.height,false);camera.aspect=rect.width/Math.max(1,rect.height);camera.updateProjectionMatrix()};new ResizeObserver(resize).observe(viewport);resize();
 // Rear-facing walls hide automatically, keeping the miniature readable from every side.
 let previousTime=0;renderer.setAnimationLoop(time=>{const dt=previousTime?Math.min((time-previousTime)/1000,.05):1/60;previousTime=time;controls.update(dt);rear.visible=!state.top&&camera.position.z>-2.55;right.visible=!state.top&&camera.position.x<2.75;const target=controls.target;const clamped=new THREE.Vector3(THREE.MathUtils.clamp(target.x,-2,2),THREE.MathUtils.clamp(target.y,.1,2),THREE.MathUtils.clamp(target.z,-2,2));camera.position.add(clamped.clone().sub(target));target.copy(clamped);renderer.render(scene,camera)});
 renderer.domElement.addEventListener('webglcontextlost',e=>{e.preventDefault();toast('3D graphics paused. Reload the page to restore the room.')});
 window.__room3d={scene,camera,controls,renderer,state:()=>({...state}),version:THREE.REVISION};
 $('#loading').remove();sync();
} catch(error) {
 console.error('Unable to load the 3D room:',error);
 const loading=$('#loading');loading.innerHTML='<div><strong>The 3D room could not load.</strong><p style="line-height:1.8">Check your internet connection and enable WebGL / hardware acceleration in your browser.</p><button class="reset" id="retry3d">Try again</button></div>';
 $('#retry3d').onclick=()=>location.reload();
 for(const id of ['iso','top','in','out','spin'])$('#'+id).disabled=true;
}


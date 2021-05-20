function demo() {

	// config physics setting
	phy.set( {substep:1, gravity:[0,-9.81,0]});

	// add static ground
	phy.add({ type:'plane', size:[300,1,300], visible:false });

	// add dynamic sphere
	phy.add({ name:'box1', size:[1,1,1], pos:[-100,2,0], density:1, restitution:0.5, friction:0.9 });
    phy.add({ name:'box2', size:[1,1,1], pos:[ 100,2,0], density:1, restitution:0.5, friction:0.9 });

    // add simple joint
    phy.add({ type:'joint', mode:'Ragdoll', b1:'box1', b2:'box2', pos1:[1,0,0], pos2:[-1,0,0], sd:[10, 1] });


     phy.add({ type:'ray' });

      phy.add({ type:'ray', begin:[1,4,0], end:[1,0.1,0] });
      phy.add({ type:'ray', begin:[-1,4,0], end:[-1,0.1,0] });


}
import {
    ShaderChunk,DoubleSide,RGBAFormat,
    CubeCamera, Scene, WebGLCubeRenderTarget, Mesh, ShaderMaterial,
} from '../../../build/three.module.js';


const shaders = [];

const uniforms = {

	renderMode: { value: 0 },
	fogTime: { value: 0.0 },

	Shadow: { value: 0.25 },
    ShadowLuma: { value: 0 },
    ShadowContrast: { value: 1 },
    ShadowGamma: { value: 0.25 },
	//shadowAlpha: { value: 1.0 }
};


export class Shader {

	static init ( o = {} ) {

        this.up( o );

        //if( o.shadow ) uniforms.Shadow.value = o.shadow;

		//return;

		let s = ShaderChunk.common;
        s = s.replace( '#define EPSILON 1e-6', `
        	#define EPSILON 1e-6
        	uniform float Shadow;
            uniform float ShadowLuma;
            uniform float ShadowContrast;
            uniform float ShadowGamma;

            vec3 brightnessContrastCorrection(vec3 value, float brightness, float contrast){
                return (value - 0.5) * contrast + 0.5 + brightness;
            }

            vec3 GammaCorrection(vec3 value, float param){
                return vec3(pow(abs(value.r), param),pow(abs(value.g), param),pow(abs(value.b), param));
            }

        `);

        ShaderChunk.common = s;

        

        //THREE.ShaderChunk.lights_fragment_begin = s;


        s = ShaderChunk.clipping_planes_fragment;

        s = s.replace( '#if NUM_CLIPPING_PLANES > 0', `
        	vec3 shadowR = vec3(1.0);
            vec3 shadowF = vec3(1.0);

        	#if NUM_CLIPPING_PLANES > 0
        `);

        ShaderChunk.clipping_planes_fragment = s;




        

        s = ShaderChunk.lights_fragment_begin;

        s = s.replace( 'IncidentLight directLight;', `
        	
            //vec3 shadowR = vec3(1.0);

        	IncidentLight directLight;
        `);

        // point
        s = s.replace( 'directLight.color *= all( bvec2( directLight.visible, receiveShadow ) ) ? getPointShadow( pointShadowMap[ i ], pointLightShadow.shadowMapSize, pointLightShadow.shadowBias, pointLightShadow.shadowRadius, vPointShadowCoord[ i ], pointLightShadow.shadowCameraNear, pointLightShadow.shadowCameraFar ) : 1.0;', `
        	shadowR = vec3(1.0);
        	shadowR *= all( bvec2( directLight.visible, receiveShadow ) ) ? getPointShadow( pointShadowMap[ i ], pointLightShadow.shadowMapSize, pointLightShadow.shadowBias, pointLightShadow.shadowRadius, vPointShadowCoord[ i ], pointLightShadow.shadowCameraNear, pointLightShadow.shadowCameraFar ) : 1.0;
        	directLight.color *= shadowR;
            shadowF *= shadowR;
        `);

        // spot
        s = s.replace( 'directLight.color *= all( bvec2( directLight.visible, receiveShadow ) ) ? getShadow( spotShadowMap[ i ], spotLightShadow.shadowMapSize, spotLightShadow.shadowBias, spotLightShadow.shadowRadius, vSpotShadowCoord[ i ] ) : 1.0;', `
            shadowR = vec3(1.0);
        	shadowR *= all( bvec2( directLight.visible, receiveShadow ) ) ? getShadow( spotShadowMap[ i ], spotLightShadow.shadowMapSize, spotLightShadow.shadowBias, spotLightShadow.shadowRadius, vSpotShadowCoord[ i ] ) : 1.0;
        	directLight.color *= shadowR;
            shadowF *= shadowR;
        `);

        // direct
        s = s.replace( 'directLight.color *= all( bvec2( directLight.visible, receiveShadow ) ) ? getShadow( directionalShadowMap[ i ], directionalLightShadow.shadowMapSize, directionalLightShadow.shadowBias, directionalLightShadow.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;', `
            shadowR = vec3(1.0);
        	shadowR *= all( bvec2( directLight.visible, receiveShadow ) ) ? getShadow( directionalShadowMap[ i ], directionalLightShadow.shadowMapSize, directionalLightShadow.shadowBias, directionalLightShadow.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
        	directLight.color *= shadowR;
            shadowF *= shadowR;
        `);

        

        ShaderChunk.lights_fragment_begin = s;

       /* s = THREE.ShaderChunk.tonemapping_fragment;

        s = s.replace( '#if defined( TONE_MAPPING )', `
            #if defined( USE_SHADOWMAP )
            gl_FragColor.rgb = mix( gl_FragColor.rgb, gl_FragColor.rgb * shadowR, Shadow);
            #endif

            #if defined( TONE_MAPPING )
        `);

        THREE.ShaderChunk.tonemapping_fragment = s;*/


       s = ShaderChunk.fog_fragment;

        s = s.replace( '#ifdef USE_FOG', `

        	#if defined( USE_SHADOWMAP )
            shadowF = brightnessContrastCorrection( shadowF, ShadowLuma, ShadowContrast );
            shadowF = GammaCorrection( shadowF, ShadowGamma );

            shadowF = clamp( shadowF, 0.0, 1.0 );

            //gl_FragColor *= vec4( shad, Shadow );
        	gl_FragColor.rgb = mix( gl_FragColor.rgb, gl_FragColor.rgb * shadowF.rgb, Shadow );
        	#endif

        	#ifdef USE_FOG
        `);

        ShaderChunk.fog_fragment = s;


        //console.log('shadow modif on')

        /*s = THREE.ShaderChunk.dithering_fragment;

        s = s.replace( '#ifdef DITHERING', `
            #if defined( USE_SHADOWMAP )
            gl_FragColor.rgb = mix( gl_FragColor.rgb, gl_FragColor.rgb * shadowR, Shadow);
            #endif

            #ifdef DITHERING
        `);

        THREE.ShaderChunk.dithering_fragment = s;*/






		//this.shaders=[];
		//this.uniforms = {};

	}

    static add ( m ) {
        m.shadowSide = DoubleSide;

        m.onBeforeCompile = function ( shader ) {
            Shader.modify( shader );
        }// Shader.modify;

        //console.log(m)
    }


    static modify ( s ) {

       shaders.push( s );
       // apply global uniform
       for( let n in uniforms ){

       	    s.uniforms[n] = uniforms[n];

       }

       // start add

       /*let fragment = s.fragmentShader;

        fragment.replace( 'vec4 diffuseColor = vec4( diffuse, opacity );', `
            vec4 diffuseColor = vec4( diffuse, opacity );
            vec3 shadowR = vec3(1.0);
        `);
        s.fragmentShader = fragment;*/

    }

    static up ( o ) {

        for( let n in o ){

            if( uniforms[n] ){ 
                if( uniforms[n].value.isColor ) uniforms[n].value.setHex( o[n] );
                else uniforms[n].value = o[n];

            }
        }

    	/*for ( let s of shaders ){

    		for( let n in o ){

    			if( s.uniforms[n] ){ 
                    if( s.uniforms[n].value.isColor ) s.uniforms[n].value.setHex( o[n] );
                    else s.uniforms[n].value = o[n];

                }
    		}

    	}*/

    }


    static CubeNormal ( o = {} ){

        let target = new WebGLCubeRenderTarget( 256, { format: RGBAFormat });

        let camera = new CubeCamera( 0.001, 10, target );
        let scene = new Scene();
        scene.add( camera );

        let normal = new ShaderMaterial({
            vertexShader: ["varying vec3 vNormalm;", "void main() {", "vNormalm = normal;", "gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );", "}"].join("\n"),
            fragmentShader: ["varying vec3 vNormalm;", "void main() {", "vec3 color = normalize(vNormalm);", "color = color * 0.5 + 0.5;", "gl_FragColor = vec4( color.x, color.y, color.z, 1.0 );", "}"].join("\n"),
            side: DoubleSide
        });

        //console.log(normal)

        let m = new Mesh( o.geometry, normal );
        m.scale.set(10,10,10);
        m.frustumCulled = false;
        m.geometry.center();
        scene.add( m );

        camera.update( o.renderer, scene );

        
        scene.remove( m );
        scene.remove( camera );

        m.material.dispose();
        m.geometry.dispose();

        //target.texture.needsUpdate = true;

        return target.texture;

    }



}




/**
 * Sky.js — vendored for offline use.
 *
 * This is the three.js example object `examples/js/objects/Sky.js` as it stands
 * in r128, in its classic-script (non-module) form, so it can be loaded with a
 * plain <script> tag next to vendor/three.min.js and used from file://.
 *
 * three.js is MIT licensed. Copyright 2010-2021 three.js authors.
 * Sky shader: based on "A Practical Analytic Model for Daylight" (Preetham,
 * Shirley, Smits), by zz85 / Simon Wallner / Martin Upitis / Egor Yusov.
 *
 * WHY THIS FILE EXISTS
 * --------------------
 * vendor/three.min.js is the core build only. `THREE.Sky` is NOT in it — it
 * lives in examples/, which is not bundled. Verified:
 *     grep -c "Sky" vendor/three.min.js  ->  0
 * So the atmospheric scattering sky has to be vendored, and this is it.
 *
 * Uses only core r128 API: ShaderMaterial, UniformsUtils.clone, BoxGeometry,
 * Mesh, Vector3, BackSide — all verified present in the vendored build.
 *
 * Usage:
 *     var sky = new THREE.Sky();
 *     sky.scale.setScalar( 450000 );
 *     scene.add( sky );
 *     sky.material.uniforms.turbidity.value = 10;
 *     sky.material.uniforms.sunPosition.value.set( x, y, z );
 */

( function () {

	'use strict';

	/* r128 is the release where three.js core became ES6 classes, so THREE.Mesh
	   can no longer be borrowed with Mesh.call( this, ... ) — that throws
	   "Class constructor cannot be invoked without 'new'". The r128 examples/js
	   builds use `class X extends THREE.Y` for exactly this reason, and so does
	   this file. */
	class Sky extends THREE.Mesh {

		constructor() {

			const shader = Sky.SkyShader;

			const material = new THREE.ShaderMaterial( {
				name: 'SkyShader',
				fragmentShader: shader.fragmentShader,
				vertexShader: shader.vertexShader,
				uniforms: THREE.UniformsUtils.clone( shader.uniforms ),
				side: THREE.BackSide,
				depthWrite: false
			} );

			super( new THREE.BoxGeometry( 1, 1, 1 ), material );

			this.isSky = true;

		}

	}

	Sky.SkyShader = {

		uniforms: {
			'turbidity': { value: 2 },
			'rayleigh': { value: 1 },
			'mieCoefficient': { value: 0.005 },
			'mieDirectionalG': { value: 0.8 },
			'sunPosition': { value: new THREE.Vector3() },
			'up': { value: new THREE.Vector3( 0, 1, 0 ) }
		},

		vertexShader: [
			'uniform vec3 sunPosition;',
			'uniform float rayleigh;',
			'uniform float turbidity;',
			'uniform float mieCoefficient;',
			'uniform vec3 up;',

			'varying vec3 vWorldPosition;',
			'varying vec3 vSunDirection;',
			'varying float vSunfade;',
			'varying vec3 vBetaR;',
			'varying vec3 vBetaM;',
			'varying float vSunE;',

			'const float e = 2.71828182845904523536028747135266249775724709369995957;',
			'const float pi = 3.141592653589793238462643383279502884197169;',

			// wavelength of used primaries, according to preetham
			// const vec3 lambda = vec3( 680E-9, 550E-9, 450E-9 );
			// this pre-calculation replaces older TotalRayleigh(vec3 lambda) function:
			// (8.0 * pow(pi, 3.0) * pow(pow(n, 2.0) - 1.0, 2.0) * (6.0 + 3.0 * pn)) /
			//   (3.0 * N * pow(lambda, vec3(4.0)) * (6.0 - 7.0 * pn))
			'const vec3 totalRayleigh = vec3( 5.804542996261093E-6, 1.3562911419845635E-5, 3.0265902468824876E-5 );',

			// mie stuff — K coefficient for the primaries
			// const float v = 4.0;
			// const vec3 K = vec3( 0.686, 0.678, 0.666 );
			// MieConst = pi * pow( ( 2.0 * pi ) / lambda, vec3( v - 2.0 ) ) * K
			'const vec3 MieConst = vec3( 1.8399918514433978E14, 2.7798023919660528E14, 4.0790479543861094E14 );',

			// earth shadow hack — cutoffAngle = pi / 1.95;
			'const float cutoffAngle = 1.6110731556870734;',
			'const float steepness = 1.5;',
			'const float EE = 1000.0;',

			'float sunIntensity( float zenithAngleCos ) {',
			'	zenithAngleCos = clamp( zenithAngleCos, -1.0, 1.0 );',
			'	return EE * max( 0.0, 1.0 - pow( e, -( ( cutoffAngle - acos( zenithAngleCos ) ) / steepness ) ) );',
			'}',

			'vec3 totalMie( float T ) {',
			'	float c = ( 0.2 * T ) * 10E-18;',
			'	return 0.434 * c * MieConst;',
			'}',

			'void main() {',
			'	vec4 worldPosition = modelMatrix * vec4( position, 1.0 );',
			'	vWorldPosition = worldPosition.xyz;',

			'	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );',
			'	gl_Position.z = gl_Position.w;', // set z to camera.far

			'	vSunDirection = normalize( sunPosition );',
			'	vSunE = sunIntensity( dot( vSunDirection, up ) );',
			'	vSunfade = 1.0 - clamp( 1.0 - exp( ( sunPosition.y / 450000.0 ) ), 0.0, 1.0 );',

			'	float rayleighCoefficient = rayleigh - ( 1.0 * ( 1.0 - vSunfade ) );',

			// extinction (absorption + out scattering) — rayleigh coefficients
			'	vBetaR = totalRayleigh * rayleighCoefficient;',
			// mie coefficients
			'	vBetaM = totalMie( turbidity ) * mieCoefficient;',
			'}'
		].join( '\n' ),

		fragmentShader: [
			'varying vec3 vWorldPosition;',
			'varying vec3 vSunDirection;',
			'varying float vSunfade;',
			'varying vec3 vBetaR;',
			'varying vec3 vBetaM;',
			'varying float vSunE;',

			'uniform float mieDirectionalG;',
			'uniform vec3 up;',

			'const vec3 cameraPos = vec3( 0.0, 0.0, 0.0 );',
			'const float pi = 3.141592653589793238462643383279502884197169;',

			'const float n = 1.0003;',   // refractive index of air
			'const float N = 2.545E25;', // molecules per unit volume, air at 288.15K / 1013mb

			// optical length at zenith for molecules
			'const float rayleighZenithLength = 8.4E3;',
			'const float mieZenithLength = 1.25E3;',
			// 66 arc seconds -> degrees, and the cosine of that
			'const float sunAngularDiameterCos = 0.999956676946448443553574619906976478926848692873900859324;',

			'const float THREE_OVER_SIXTEENPI = 0.05968310365946075;', // 3 / (16 pi)
			'const float ONE_OVER_FOURPI = 0.07957747154594767;',      // 1 / (4 pi)

			'float rayleighPhase( float cosTheta ) {',
			'	return THREE_OVER_SIXTEENPI * ( 1.0 + pow( cosTheta, 2.0 ) );',
			'}',

			'float hgPhase( float cosTheta, float g ) {',
			'	float g2 = pow( g, 2.0 );',
			'	float inverse = 1.0 / pow( 1.0 - 2.0 * g * cosTheta + g2, 1.5 );',
			'	return ONE_OVER_FOURPI * ( ( 1.0 - g2 ) * inverse );',
			'}',

			'void main() {',
			'	vec3 direction = normalize( vWorldPosition - cameraPos );',

			// optical length, cutoff angle at 90 to avoid singularity
			'	float zenithAngle = acos( max( 0.0, dot( up, direction ) ) );',
			'	float inverse = 1.0 / ( cos( zenithAngle ) + 0.15 * pow( 93.885 - ( ( zenithAngle * 180.0 ) / pi ), -1.253 ) );',
			'	float sR = rayleighZenithLength * inverse;',
			'	float sM = mieZenithLength * inverse;',

			// combined extinction factor
			'	vec3 Fex = exp( -( vBetaR * sR + vBetaM * sM ) );',

			// in scattering
			'	float cosTheta = dot( direction, vSunDirection );',

			'	float rPhase = rayleighPhase( cosTheta * 0.5 + 0.5 );',
			'	vec3 betaRTheta = vBetaR * rPhase;',

			'	float mPhase = hgPhase( cosTheta, mieDirectionalG );',
			'	vec3 betaMTheta = vBetaM * mPhase;',

			'	vec3 Lin = pow( vSunE * ( ( betaRTheta + betaMTheta ) / ( vBetaR + vBetaM ) ) * ( 1.0 - Fex ), vec3( 1.5 ) );',
			'	Lin *= mix( vec3( 1.0 ), pow( vSunE * ( ( betaRTheta + betaMTheta ) / ( vBetaR + vBetaM ) ) * Fex, vec3( 1.0 / 2.0 ) ), clamp( pow( 1.0 - dot( up, vSunDirection ), 5.0 ), 0.0, 1.0 ) );',

			// nightsky
			'	float theta = acos( direction.y );',
			'	float phi = atan( direction.z, direction.x );',
			'	vec2 uv = vec2( phi, theta ) / vec2( 2.0 * pi, pi ) + vec2( 0.5, 0.0 );',
			'	vec3 L0 = vec3( 0.1 ) * Fex;',

			// composition + solar disc
			'	float sundisk = smoothstep( sunAngularDiameterCos, sunAngularDiameterCos + 0.00002, cosTheta );',
			'	L0 += ( vSunE * 19000.0 * Fex ) * sundisk;',

			'	vec3 texColor = ( Lin + L0 ) * 0.04 + vec3( 0.0, 0.0003, 0.00075 );',

			'	vec3 retColor = pow( texColor, vec3( 1.0 / ( 1.2 + ( 1.2 * vSunfade ) ) ) );',

			'	gl_FragColor = vec4( retColor, 1.0 );',

			'	#include <tonemapping_fragment>',
			'	#include <encodings_fragment>',
			'}'
		].join( '\n' )

	};

	THREE.Sky = Sky;

} )();

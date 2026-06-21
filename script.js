// VCAN 3D - Interactive JS & Animation Engine

document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    initThreeJS();
    initGSAPAnimations();
    initCardTilt();
    initMagneticButtons();
    initPortfolio();
});

/* =========================================================================
   1. NAVIGATION & SCROLL EVENT BINDINGS
   ========================================================================= */
function initNavigation() {
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    const navbar = document.querySelector('.navbar');

    if ('scrollRestoration' in history && window.location.hash) {
        history.scrollRestoration = 'manual';
    }

    if (window.location.hash) {
        requestAnimationFrame(() => {
            const targetEl = document.querySelector(window.location.hash);
            if (targetEl && navbar) {
                const navHeight = navbar.offsetHeight;
                const targetPosition = targetEl.getBoundingClientRect().top + window.pageYOffset - navHeight - 15;
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'auto'
                });
            }
        });
    }

    if (hamburger && navLinks) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            navLinks.classList.toggle('open');
            document.body.classList.toggle('nav-open', navLinks.classList.contains('open'));
        });

        // Close menu when clicking nav links
        document.querySelectorAll('.nav-links a').forEach(link => {
            link.addEventListener('click', () => {
                hamburger.classList.remove('active');
                navLinks.classList.remove('open');
                document.body.classList.remove('nav-open');
            });
        });
    }

    // Navbar background blur/glow state on scroll
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    }, { passive: true });

    // Smooth scroll for nav anchors
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            if (targetId !== '#') {
                const targetEl = document.querySelector(targetId);
                if (targetEl) {
                    e.preventDefault();
                    const navHeight = navbar.offsetHeight;
                    const targetPosition = targetEl.getBoundingClientRect().top + window.pageYOffset - navHeight - 15;
                    
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                }
            }
        });
    });

    // Keep browser Back from service pages anchored to the services section.
    document.querySelectorAll('.service-card[href^="services/"]').forEach(link => {
        link.addEventListener('click', () => {
            const currentUrl = new URL('#services', window.location.href);
            history.replaceState(null, '', currentUrl);
        });
    });

    // Scroll to Top functionality
    const scrollTopBtn = document.getElementById('scroll-to-top');
    if (scrollTopBtn) {
        scrollTopBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
        
        // Show/hide scroll to top button based on scroll position
        window.addEventListener('scroll', () => {
            if (window.scrollY > 500) {
                scrollTopBtn.parentElement.style.display = 'flex';
                setTimeout(() => {
                    scrollTopBtn.parentElement.style.opacity = '1';
                }, 10);
            } else {
                scrollTopBtn.parentElement.style.opacity = '0';
                setTimeout(() => {
                    if (window.scrollY <= 500) {
                        scrollTopBtn.parentElement.style.display = 'none';
                    }
                }, 400);
            }
        }, { passive: true });
    }
}

/* =========================================================================
   2. THREE.JS 3D SCENE & PARTICLES
   ========================================================================= */
function initThreeJS() {
    const canvas = document.querySelector('#webgl-canvas');
    if (!canvas) return;

    const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
    const lerp = (start, end, amount) => start + (end - start) * amount;
    const easeInOut = (value) => value * value * (3 - 2 * value);
    const damp = (current, target, smoothing, delta) => lerp(current, target, 1 - Math.exp(-smoothing * delta));
    const setGroupOpacity = (group, opacity) => {
        group.traverse((object) => {
            if (object.material) {
                object.material.opacity = opacity;
                object.material.transparent = true;
            }
        });
    };

    // Scene setup
    const scene = new THREE.Scene();

    // Camera setup
    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.z = 8;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        alpha: true,
        antialias: true
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
    scene.add(ambientLight);

    const saffronColor = 0xFF9933;
    const greenColor = 0x138808;
    const chakraBlue = 0x000080;
    const whiteColor = 0xFFFFFF;

    const saffronLight = new THREE.PointLight(saffronColor, 1.8, 35);
    saffronLight.position.set(5, 5, 5);
    scene.add(saffronLight);

    const greenLight = new THREE.PointLight(greenColor, 1.6, 35);
    greenLight.position.set(-5, -5, 5);
    scene.add(greenLight);

    const chakraLight = new THREE.PointLight(chakraBlue, 1.2, 30);
    chakraLight.position.set(0, 3, -5);
    scene.add(chakraLight);

    const globeLight = new THREE.PointLight(whiteColor, 0.9, 20);
    globeLight.position.set(0, 0, 2);
    scene.add(globeLight);

    // Geometry 1: Complex Morphed Torus Knot (represents 3D precision printing)
    const torusGeometry = new THREE.TorusKnotGeometry(1.6, 0.45, 120, 16);
    
    // Store original positions for wavy deformation
    const originalTorusPositions = torusGeometry.attributes.position.array.slice();

    const torusMaterial = new THREE.MeshPhongMaterial({
        color: greenColor,
        emissive: saffronColor,
        wireframe: true,
        transparent: true,
        opacity: 0.85,
        shininess: 120
    });
    const torusMesh = new THREE.Mesh(torusGeometry, torusMaterial);
    scene.add(torusMesh);

    // Geometry 2: Outer glowing points wrapping the mesh (sharing the same geometry for synchronized deformation)
    const pointsMaterial = new THREE.PointsMaterial({
        color: saffronColor,
        size: 0.04,
        transparent: true,
        opacity: 0.9
    });
    const torusPoints = new THREE.Points(torusGeometry, pointsMaterial);
    scene.add(torusPoints);

    // Geometry 3: Particle system (Space dust field)
    const particlesCount = window.innerWidth < 768 ? 600 : 1500;
    const particlesGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particlesCount * 3);
    const colors = new Float32Array(particlesCount * 3);

    const colorSaffron = new THREE.Color(saffronColor);
    const colorGreen = new THREE.Color(greenColor);
    const colorBlue = new THREE.Color(chakraBlue);

    for (let i = 0; i < particlesCount * 3; i += 3) {
        positions[i] = (Math.random() - 0.5) * 25;
        positions[i + 1] = (Math.random() - 0.5) * 20;
        positions[i + 2] = (Math.random() - 0.5) * 15;

        const rand = Math.random();
        let mixedColor;
        if (rand < 0.4) {
            mixedColor = colorSaffron;
        } else if (rand < 0.7) {
            mixedColor = colorGreen;
        } else {
            mixedColor = colorBlue;
        }
        colors[i] = mixedColor.r;
        colors[i + 1] = mixedColor.g;
        colors[i + 2] = mixedColor.b;
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const particlesMaterial = new THREE.PointsMaterial({
        size: 0.05,
        vertexColors: true,
        transparent: true,
        opacity: 0.5,
        blending: THREE.AdditiveBlending
    });
    const particleSystem = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particleSystem);

    // Inner reveal layer that appears as the hero model expands.
    const modelCluster = new THREE.Group();
    modelCluster.visible = false;
    scene.add(modelCluster);

    const globeGroup = new THREE.Group();
    const globeMaterial = new THREE.MeshPhongMaterial({
        color: whiteColor,
        emissive: saffronColor,
        shininess: 110,
        transparent: true,
        opacity: 0
    });
    const globeMesh = new THREE.Mesh(new THREE.SphereGeometry(0.48, 48, 32), globeMaterial);
    globeGroup.add(globeMesh);

    const globeWireMaterial = new THREE.MeshBasicMaterial({
        color: greenColor,
        wireframe: true,
        transparent: true,
        opacity: 0
    });
    const globeWire = new THREE.Mesh(new THREE.SphereGeometry(0.505, 32, 18), globeWireMaterial);
    globeGroup.add(globeWire);

    const atmosphereMaterial = new THREE.MeshBasicMaterial({
        color: saffronColor,
        transparent: true,
        opacity: 0,
        blending: THREE.AdditiveBlending,
        side: THREE.BackSide
    });
    const atmosphere = new THREE.Mesh(new THREE.SphereGeometry(0.68, 48, 32), atmosphereMaterial);
    globeGroup.add(atmosphere);

    const ringMaterial = new THREE.LineBasicMaterial({
        color: greenColor,
        transparent: true,
        opacity: 0
    });
    const rings = [
        new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(makeCirclePoints(0.76, 96)), ringMaterial.clone()),
        new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(makeCirclePoints(0.92, 112)), ringMaterial.clone()),
        new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(makeCirclePoints(1.08, 128)), ringMaterial.clone())
    ];
    rings[0].rotation.x = Math.PI * 0.5;
    rings[1].rotation.x = Math.PI * 0.62;
    rings[1].rotation.y = Math.PI * 0.16;
    rings[2].rotation.x = Math.PI * 0.44;
    rings[2].rotation.z = Math.PI * 0.18;
    rings.forEach(ring => globeGroup.add(ring));

    const globeStarsCount = 180;
    const globeStarsGeometry = new THREE.BufferGeometry();
    const globeStarPositions = new Float32Array(globeStarsCount * 3);
    for (let i = 0; i < globeStarsCount; i++) {
        const radius = 0.82 + Math.random() * 0.62;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos((Math.random() * 2) - 1);
        const index = i * 3;
        globeStarPositions[index] = radius * Math.sin(phi) * Math.cos(theta);
        globeStarPositions[index + 1] = radius * Math.sin(phi) * Math.sin(theta);
        globeStarPositions[index + 2] = radius * Math.cos(phi);
    }
    globeStarsGeometry.setAttribute('position', new THREE.BufferAttribute(globeStarPositions, 3));
    const globeStarsMaterial = new THREE.PointsMaterial({
        color: 0xffffff,
        size: 0.026,
        transparent: true,
        opacity: 0,
        blending: THREE.AdditiveBlending
    });
    const globeStars = new THREE.Points(globeStarsGeometry, globeStarsMaterial);
    globeGroup.add(globeStars);

    globeGroup.visible = false;
    modelCluster.add(globeGroup);

    function makeCirclePoints(radius, segments) {
        const points = [];
        for (let i = 0; i < segments; i++) {
            const angle = (i / segments) * Math.PI * 2;
            points.push(new THREE.Vector3(Math.cos(angle) * radius, Math.sin(angle) * radius, 0));
        }
        return points;
    }

    // Positioning configurations
    let isMobile = window.innerWidth < 1024;
    let isSmallMobile = window.innerWidth < 640;
    let baseMeshPosition = new THREE.Vector3(2.4, 0, 0);
    let baseMeshScale = 1;
    let revealProgress = 0;
    let revealProgressTarget = 0;
    let easedRevealProgress = 0;

    function adjustMeshPosition() {
        isMobile = window.innerWidth < 1024;
        isSmallMobile = window.innerWidth < 640;
        if (isSmallMobile) {
            baseMeshPosition.set(0, -0.16, 0);
            baseMeshScale = 0.5;
        } else if (isMobile) {
            baseMeshPosition.set(0, -0.06, 0);
            baseMeshScale = 0.72;
        } else {
            // Positioned to the right of the Hero text
            baseMeshPosition.set(window.innerWidth > 1440 ? 4.05 : 3.55, -0.02, 0);
            baseMeshScale = window.innerWidth > 1440 ? 1.16 : 1.04;
        }
    }
    adjustMeshPosition();

    // Mouse Tracking variables
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    window.addEventListener('mousemove', (e) => {
        mouseX = (e.clientX - window.innerWidth / 2) / 100;
        mouseY = (e.clientY - window.innerHeight / 2) / 100;
    });

    // Scroll Integration variables
    let scrollYTarget = window.scrollY;
    let smoothScrollY = scrollYTarget;
    window.addEventListener('scroll', () => {
        scrollYTarget = window.scrollY;
    }, { passive: true });

    function updateScrollReveal() {
        const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
        revealProgressTarget = clamp(smoothScrollY / maxScroll, 0, 1);
    }

    // Resize Handler
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
        adjustMeshPosition();
        updateScrollReveal();
    });

    // Animation Loop
    const clock = new THREE.Clock();
    const ambientGlows = document.querySelector('.ambient-glows');

    function animate() {
        requestAnimationFrame(animate);

        const delta = Math.min(clock.getDelta(), 0.05);
        const elapsedTime = clock.elapsedTime;

        // 1. Dynamic wavy deformation of the 3D printed Torus Knot
        const torusPositions = torusGeometry.attributes.position.array;
        const waveFrequency = 1.6;
        const waveAmplitude = 0.07;
        const waveSpeed = 2.4;

        for (let i = 0; i < torusPositions.length; i += 3) {
            const ox = originalTorusPositions[i];
            const oy = originalTorusPositions[i+1];
            const oz = originalTorusPositions[i+2];

            // Organic wave movement on all 3 axes using sine/cosine combinations
            const wave = Math.sin(oy * waveFrequency + elapsedTime * waveSpeed) * waveAmplitude;
            const wave2 = Math.cos(ox * waveFrequency + elapsedTime * waveSpeed * 0.9) * waveAmplitude;

            torusPositions[i] = ox + wave;
            torusPositions[i+1] = oy + wave2;
            torusPositions[i+2] = oz + wave * 0.5;
        }
        torusGeometry.attributes.position.needsUpdate = true;

        // Smooth Indian Tricolor Transitions (Saffron -> Green -> Chakra Blue -> White)
        const cycleSpeed = 0.45;
        const t1 = (Math.sin(elapsedTime * cycleSpeed) + 1) / 2;
        const t2 = (Math.sin(elapsedTime * cycleSpeed + 2.094) + 1) / 2;
        
        const colorSaffronObj = new THREE.Color(saffronColor);
        const colorGreenObj = new THREE.Color(greenColor);
        const colorBlueObj = new THREE.Color(chakraBlue);
        const colorWhiteObj = new THREE.Color(whiteColor);

        torusMaterial.emissive.lerpColors(colorSaffronObj, colorGreenObj, t1);
        torusMaterial.color.lerpColors(colorBlueObj, colorSaffronObj, t1);
        pointsMaterial.color.lerpColors(colorSaffronObj, colorGreenObj, 1 - t2);

        // Slow automatic rotation
        torusMesh.rotation.y = elapsedTime * 0.15;
        torusMesh.rotation.x = elapsedTime * 0.08;
        torusPoints.rotation.y = elapsedTime * 0.15;
        torusPoints.rotation.x = elapsedTime * 0.08;

        // Inertial follow of mouse positions
        targetX = damp(targetX, mouseX, 7, delta);
        targetY = damp(targetY, mouseY, 7, delta);
        smoothScrollY = damp(smoothScrollY, scrollYTarget, 5.8, delta);
        updateScrollReveal();
        revealProgress = damp(revealProgress, revealProgressTarget, 5.2, delta);
        easedRevealProgress = easeInOut(revealProgress);

        // 3. 3D Background Parallax in opposition to cursor
        if (ambientGlows) {
            ambientGlows.style.transform = `translate(${targetX * -20}px, ${targetY * -20}px)`;
        }

        // Mouse displacement tilt
        torusMesh.rotation.y += targetX * 0.15;
        torusMesh.rotation.x += targetY * 0.15;
        torusPoints.rotation.y += targetX * 0.15;
        torusPoints.rotation.x += targetY * 0.15;

        const scrollDrift = Math.min(smoothScrollY * 0.0015, 1.35);
        const zoomScale = isSmallMobile ? 2.9 : (isMobile ? 4.1 : 5.6);
        const driftedX = isSmallMobile ? baseMeshPosition.x : (isMobile ? baseMeshPosition.x : baseMeshPosition.x - scrollDrift * 0.85);
        const driftedY = isSmallMobile ? baseMeshPosition.y - scrollDrift * 0.18 : (isMobile ? baseMeshPosition.y - scrollDrift * 0.3 : baseMeshPosition.y - scrollDrift * 0.32);
        const currentX = lerp(driftedX, 0, easedRevealProgress);
        const currentY = lerp(driftedY, isSmallMobile ? 0.04 : (isMobile ? -0.08 : -0.02), easedRevealProgress);
        const currentZ = lerp(0, isSmallMobile ? -0.72 : -1.18, easedRevealProgress);
        const currentScale = lerp(baseMeshScale, zoomScale, easedRevealProgress);

        torusMesh.position.set(currentX, currentY, currentZ);
        torusPoints.position.copy(torusMesh.position);
        torusMesh.scale.setScalar(currentScale);
        torusPoints.scale.setScalar(currentScale);
        torusMaterial.opacity = lerp(0.75, 0.34, easedRevealProgress);
        pointsMaterial.opacity = lerp(0.8, 0.48, easedRevealProgress);

        modelCluster.visible = revealProgress > 0.02;
        modelCluster.position.set(currentX, currentY, lerp(0.24, 1.35, easedRevealProgress));
        modelCluster.scale.setScalar(lerp(0.12, isSmallMobile ? 0.76 : (isMobile ? 1.05 : 1.38), easedRevealProgress));
        setGroupOpacity(modelCluster, clamp((revealProgress - 0.12) / 0.72, 0, 1));
        modelCluster.children.forEach((child, index) => {
            const mesh = child.userData.followMesh || child;
            if (child.userData.followMesh) {
                child.position.copy(mesh.position);
                child.rotation.copy(mesh.rotation);
            } else if (child.userData.basePosition) {
                const basePosition = child.userData.basePosition;
                const floatAmount = Math.sin(elapsedTime * 1.2 + child.userData.floatOffset) * 0.06 * easedRevealProgress;
                child.position.set(basePosition.x, basePosition.y + floatAmount, basePosition.z);
                child.rotation.x += 0.006 + index * 0.0005;
                child.rotation.y += 0.009 + index * 0.0007;
            }
        });

        const globeReveal = clamp((revealProgress - 0.06) / 0.34, 0, 1);
        const globeGlow = globeReveal * (0.72 + Math.sin(elapsedTime * 4.8) * 0.28);
        globeGroup.visible = globeReveal > 0.01;
        globeGroup.scale.setScalar(lerp(0.54, isSmallMobile ? 0.86 : 1, globeReveal));
        globeGroup.rotation.y = elapsedTime * 0.18;
        globeGroup.rotation.x = Math.sin(elapsedTime * 0.5) * 0.16;
        globeMesh.rotation.y = elapsedTime * 0.12;
        globeWire.rotation.y = -elapsedTime * 0.22;
        atmosphere.scale.setScalar(1 + globeGlow * 0.16);
        globeStars.rotation.y = elapsedTime * 0.28;
        globeStars.rotation.x = elapsedTime * 0.08;
        globeMaterial.opacity = globeReveal * 0.58;
        globeMaterial.emissiveIntensity = lerp(0.25, 1.75, globeGlow);
        globeWireMaterial.opacity = globeReveal * 0.36;
        atmosphereMaterial.opacity = globeReveal * (0.16 + globeGlow * 0.24);
        globeStarsMaterial.opacity = globeReveal * 0.92;
        rings.forEach((ring, index) => {
            ring.material.opacity = globeReveal * (0.28 + globeGlow * 0.22);
            ring.rotation.z += 0.0025 + index * 0.001;
        });
        globeLight.position.set(currentX, currentY, lerp(1.2, 2.15, easedRevealProgress));
        globeLight.intensity = globeReveal * (1.2 + globeGlow * 2.2);

        // Space dust slow float + mouse drift
        particleSystem.rotation.y = elapsedTime * 0.02 + targetX * 0.02;
        particleSystem.rotation.x = elapsedTime * 0.01 + targetY * 0.02;
        particleSystem.position.z = lerp(0, isSmallMobile ? 1.35 : 2.1, easedRevealProgress);
        particlesMaterial.opacity = lerp(0.5, isSmallMobile ? 0.28 : 0.2, easedRevealProgress);
        camera.position.z = lerp(8, isSmallMobile ? 6.05 : 5.35, easedRevealProgress);

        renderer.render(scene, camera);
    }

    animate();
}

/* =========================================================================
   3. GSAP SCROLLTRIGGER REVEALS & TIMELINES
   ========================================================================= */
function initGSAPAnimations() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

    gsap.registerPlugin(ScrollTrigger);
    gsap.defaults({
        ease: 'power3.out',
        duration: 0.85
    });
    ScrollTrigger.config({
        ignoreMobileResize: true
    });
    window.addEventListener('load', () => ScrollTrigger.refresh(), { once: true });

    // Helper function to safely animate elements only if they exist
    const safeAnimate = (selector, config, timeline = null) => {
        if (document.querySelector(selector)) {
            if (timeline) {
                timeline.from(selector, config);
            } else {
                gsap.from(selector, config);
            }
        }
    };

    // Hero Section Entrance
    const heroTimeline = gsap.timeline();
    safeAnimate('.navbar', {
        y: -100,
        opacity: 0,
        duration: 1,
        ease: 'power4.out'
    }, heroTimeline);
    
    safeAnimate('.hero .tech-badge', {
        scale: 0.8,
        opacity: 0,
        duration: 0.6,
        ease: 'back.out(1.7)'
    }, heroTimeline);
    
    safeAnimate('.hero h1', {
        y: 50,
        opacity: 0,
        duration: 0.8,
        ease: 'power3.out'
    }, heroTimeline);
    
    safeAnimate('.hero p', {
        y: 30,
        opacity: 0,
        duration: 0.8,
        ease: 'power3.out'
    }, heroTimeline);
    
    safeAnimate('.hero-buttons', {
        y: 20,
        opacity: 0,
        duration: 0.8,
        ease: 'power3.out'
    }, heroTimeline);
    
    safeAnimate('.hero-img-wrapper', {
        scale: 0.9,
        opacity: 0,
        duration: 1.2,
        ease: 'power3.out'
    }, heroTimeline);

    // Section Titles ScrollTrigger Reveal
    gsap.utils.toArray('.section-title, .section-subtitle, .tagline').forEach(elem => {
        gsap.from(elem, {
            scrollTrigger: {
                trigger: elem,
                start: 'top 85%',
                toggleActions: 'play none none none'
            },
            y: 40,
            opacity: 0,
            duration: 0.8,
            ease: 'power3.out'
        });
    });

    // About Section Layout Reveals
    if (document.querySelector('.about')) {
        safeAnimate('.about-glass-card', {
            scrollTrigger: {
                trigger: '.about',
                start: 'top 75%'
            },
            x: -60,
            opacity: 0,
            duration: 1,
            ease: 'power3.out'
        });

        safeAnimate('.about-right > h2, .about-right > p, .about-feature', {
            scrollTrigger: {
                trigger: '.about',
                start: 'top 70%'
            },
            x: 60,
            opacity: 0,
            duration: 0.8,
            stagger: 0.15,
            ease: 'power3.out'
        });
    }

    // Services Grid staggered reveal
    if (document.querySelector('.services-grid')) {
        gsap.from('.services-grid .tilt-wrapper', {
            scrollTrigger: {
                trigger: '.services-grid',
                start: 'top 80%'
            },
            y: 50,
            opacity: 0,
            duration: 0.8,
            stagger: 0.12,
            ease: 'power3.out'
        });
    }

    // Why Choose Cards reveal
    if (document.querySelector('.why-grid')) {
        gsap.set('.why .tagline, .why .section-title, .why .section-subtitle, .why-card', {
            autoAlpha: 1,
            y: 0
        });

        gsap.from('.why-grid .why-card', {
            scrollTrigger: {
                trigger: '.why-grid',
                start: 'top 85%',
                toggleActions: 'play none none none',
                once: true
            },
            y: 50,
            opacity: 0,
            duration: 0.8,
            stagger: 0.12,
            ease: 'power3.out',
            immediateRender: false,
            clearProps: 'opacity,visibility,transform'
        });
    }

    // Contact Panel entrance
    if (document.querySelector('.contact-container')) {
        safeAnimate('.contact-info', {
            scrollTrigger: {
                trigger: '.contact-container',
                start: 'top 75%'
            },
            scale: 0.95,
            opacity: 0,
            duration: 1,
            ease: 'power3.out'
        });
    }

    // Process Timeline Connection line fill on scroll
    if (document.querySelector('.process-steps-container')) {
        const progressTimeline = gsap.timeline({
            scrollTrigger: {
                trigger: '.process-steps-container',
                start: 'top 40%',
                end: 'bottom 60%',
                scrub: true
            }
        });

        safeAnimate('#scroll-progress-line', {
            height: '100%',
            ease: 'none'
        }, progressTimeline);

        // Step Row activation on scroll
        const stepRows = gsap.utils.toArray('.step-row');
        stepRows.forEach((row, index) => {
            ScrollTrigger.create({
                trigger: row,
                start: 'top 60%',
                onEnter: () => row.classList.add('active'),
                onLeaveBack: () => index > 0 && row.classList.remove('active')
            });
        });
    }
}

/* =========================================================================
   4. CARD 3D TILT EFFECT
   ========================================================================= */
function initCardTilt() {
    const cards = document.querySelectorAll('.service-card');
    
    cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left; // x coordinate inside elements
            const y = e.clientY - rect.top;  // y coordinate inside elements

            // Calculate percentage from card center
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const percentX = (x - centerX) / centerX;
            const percentY = (y - centerY) / centerY;

            // Maximum rotation limits
            const maxTilt = 12; 
            const rotateY = percentX * maxTilt;
            const rotateX = -percentY * maxTilt; // Inverse rotation for vertical axis

            card.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(10px)`;
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = 'rotateX(0deg) rotateY(0deg) translateZ(0)';
        });
    });
}

/* =========================================================================
   5. MAGNETIC BUTTONS EFFECT
   ========================================================================= */
function initMagneticButtons() {
    const magneticBtns = document.querySelectorAll('.btn-glow-primary, .btn-glow-secondary, .quote-btn, .fab-btn');

    magneticBtns.forEach(btn => {
        btn.addEventListener('mousemove', (e) => {
            const rect = btn.getBoundingClientRect();
            const btnX = rect.left + rect.width / 2;
            const btnY = rect.top + rect.height / 2;

            // Distance vector
            const mouseX = e.clientX;
            const mouseY = e.clientY;
            const distX = mouseX - btnX;
            const distY = mouseY - btnY;

            // Magnetic radius pull limit
            const maxPull = btn.classList.contains('fab-btn') ? 12 : 20;
            const pullX = distX * 0.35;
            const pullY = distY * 0.35;

            // Constrain pull values
            const finalX = Math.max(-maxPull, Math.min(maxPull, pullX));
            const finalY = Math.max(-maxPull, Math.min(maxPull, pullY));

            btn.style.transform = `translate(${finalX}px, ${finalY}px) scale(1.03)`;
            if (btn.classList.contains('btn-glow')) {
                btn.style.boxShadow = `0 10px 25px rgba(0, 240, 255, 0.45)`;
            }
        });

        btn.addEventListener('mouseleave', () => {
            btn.style.transform = 'translate(0px, 0px) scale(1)';
            if (btn.classList.contains('btn-glow')) {
                btn.style.boxShadow = '';
            }
        });
    });
}

/* =========================================================================
   6. PORTFOLIO FILTER & LIGHTBOX GALLERY
   ========================================================================= */
function initPortfolio() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const portfolioItems = document.querySelectorAll('.portfolio-item');
    const lightbox = document.getElementById('portfolio-lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxTitle = document.getElementById('lightbox-title');
    const lightboxDesc = document.getElementById('lightbox-desc');
    const lightboxClose = document.querySelector('.lightbox-close');

    if (!lightbox) return;

    // Filtering logic
    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active status
            filterButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const filterValue = btn.getAttribute('data-filter');

            portfolioItems.forEach(item => {
                const category = item.getAttribute('data-category');
                
                if (filterValue === 'all' || category === filterValue) {
                    item.style.display = 'block';
                    setTimeout(() => {
                        item.style.opacity = '1';
                        item.style.transform = 'scale(1)';
                    }, 50);
                } else {
                    item.style.opacity = '0';
                    item.style.transform = 'scale(0.85)';
                    setTimeout(() => {
                        item.style.display = 'none';
                    }, 300);
                }
            });
        });
    });

    // Lightbox open
    portfolioItems.forEach(item => {
        item.addEventListener('click', () => {
            const imgSrc = item.getAttribute('data-img');
            const title = item.querySelector('h3').innerText;
            const desc = item.getAttribute('data-desc');

            lightboxImg.src = imgSrc;
            lightboxTitle.innerText = title;
            lightboxDesc.innerText = desc;

            lightbox.classList.add('active');
            document.body.style.overflow = 'hidden'; // Stop page scrolling
            
            // GSAP lightbox animation
            if (typeof gsap !== 'undefined') {
                gsap.fromTo('.lightbox-content', 
                    { scale: 0.85, opacity: 0 },
                    { scale: 1, opacity: 1, duration: 0.4, ease: 'back.out(1.5)' }
                );
            }
        });
    });

    // Lightbox close helpers
    function closeLightbox() {
        if (typeof gsap !== 'undefined') {
            gsap.to('.lightbox-content', {
                scale: 0.85,
                opacity: 0,
                duration: 0.3,
                ease: 'power2.in',
                onComplete: () => {
                    lightbox.classList.remove('active');
                    document.body.style.overflow = ''; // Resume scrolling
                }
            });
        } else {
            lightbox.classList.remove('active');
            document.body.style.overflow = '';
        }
    }

    if (lightboxClose) {
        lightboxClose.addEventListener('click', closeLightbox);
    }

    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) {
            closeLightbox();
        }
    });

    // Close on ESC key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && lightbox.classList.contains('active')) {
            closeLightbox();
        }
    });
}

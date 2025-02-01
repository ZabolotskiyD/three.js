// main.js

// Импортируем необходимые библиотеки
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.140.0/build/three.module.js';
import * as TWEEN from 'https://cdn.jsdelivr.net/npm/@tweenjs/tween.js@18.6.4/dist/tween.esm.js';

// Глобальные переменные
let scenes = [];
let currentIndex = 0;
const renderer = new THREE.WebGLRenderer({ antialias: true });
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

// Инициализация рендера и камеры
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Создание трех сцен
function createScene(color) {
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(color);

    // Добавляем объекты в сцену (например, куб)
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshStandardMaterial({ color: 0xffffff });
    const cube = new THREE.Mesh(geometry, material);
    scene.add(cube);

    // Сохраняем ссылку на куб в сцене
    scene.cube = cube;

    return scene;
}

scenes.push(createScene(0x3498db)); // Сцена 1 (синяя)
scenes.push(createScene(0xe74c3c)); // Сцена 2 (красная)
scenes.push(createScene(0x2ecc71)); // Сцена 3 (зеленая)

// Позиционирование камер
camera.position.z = 5;

// Флаг для предотвращения множественных переходов одновременно
let isTransitioning = false;

// Функция для плавного перехода между сценами
function transitionTo(index) {
    if (isTransitioning || index === currentIndex) return;
    isTransitioning = true;

    const currentScene = scenes[currentIndex];
    const nextScene = scenes[index];

    currentScene.children.forEach((object) => {
        object.material.opacity = 1;
        object.material.transparent = true;
    });

    nextScene.children.forEach((object) => {
        object.material.opacity = 0;
        object.material.transparent = true;
    });

    new TWEEN.Tween({ opacity: 1 })
        .to({ opacity: 0 }, 1000)
        .onUpdate(({ opacity }) => {
            currentScene.children.forEach((object) => {
                object.material.opacity = opacity;
            });
        })
        .onComplete(() => {
            currentIndex = index;

            new TWEEN.Tween({ opacity: 0 })
                .to({ opacity: 1 }, 1000)
                .onUpdate(({ opacity }) => {
                    nextScene.children.forEach((object) => {
                        object.material.opacity = opacity;
                    });
                })
                .onComplete(() => {
                    isTransitioning = false;
                })
                .start();
        })
        .start();
}

// Обработка скролла
window.addEventListener('wheel', (event) => {
    if (event.deltaY > 0 && currentIndex < scenes.length - 1) {
        transitionTo(currentIndex + 1);
    } else if (event.deltaY < 0 && currentIndex > 0) {
        transitionTo(currentIndex - 1);
    }
});

// Обработка свайпов для мобильных устройств
let xDown = null;
let yDown = null;

function handleTouchStart(evt) {
    xDown = evt.touches[0].clientX;
    yDown = evt.touches[0].clientY;
}

function handleTouchMove(evt) {
    if (!xDown || !yDown) return;

    const yUp = evt.touches[0].clientY;
    const yDiff = yDown - yUp;

    if (yDiff > 0 && currentIndex < scenes.length - 1) {
        transitionTo(currentIndex + 1);
    } else if (yDiff < 0 && currentIndex > 0) {
        transitionTo(currentIndex - 1);
    }

    xDown = null;
    yDown = null;
}

window.addEventListener('touchstart', handleTouchStart, false);
window.addEventListener('touchmove', handleTouchMove, false);

// Отрисовка сцены
function animate() {
    requestAnimationFrame(animate);

    // Вращаем куб на текущей сцене
    const currentScene = scenes[currentIndex];
    if (currentScene && currentScene.cube) {
        currentScene.cube.rotation.x += 0.01; // Вращение по оси X
        currentScene.cube.rotation.y += 0.01; // Вращение по оси Y
    }

    TWEEN.update(); // Убедитесь, что TWEEN обновляется перед рендерингом
    renderer.render(scenes[currentIndex], camera);
}

animate();

// Обработчик изменения размера окна
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
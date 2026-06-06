export function createExplosion(scene, x, y, color = 0x4fffb0, count = 18) {
  for (let i = 0; i < count; i++) {
    const angle = (Math.PI * 2 / count) * i;
    const speed = Phaser.Math.Between(80, 220);
    const size = Phaser.Math.Between(3, 8);
    const life = Phaser.Math.Between(350, 700);

    const p = scene.add.rectangle(x, y, size, size, color);
    p.setDepth(40);

    scene.tweens.add({
      targets: p,
      x: x + Math.cos(angle) * speed * 0.6,
      y: y + Math.sin(angle) * speed * 0.6,
      scaleX: 0,
      scaleY: 0,
      alpha: 0,
      duration: life,
      ease: 'Power2',
      onComplete: () => p.destroy(),
    });
  }
}

export function createCoinBurst(scene, x, y) {
  for (let i = 0; i < 8; i++) {
    const angle = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI;
    const speed = Phaser.Math.Between(60, 140);

    const star = scene.add.text(x, y, '✦', {
      fontSize: `${Phaser.Math.Between(10, 18)}px`,
      color: '#ffd700',
    });
    star.setDepth(41);
    star.setOrigin(0.5);

    scene.tweens.add({
      targets: star,
      x: x + Math.cos(angle) * speed,
      y: y + Math.sin(angle) * speed - 20,
      alpha: 0,
      scale: 0.2,
      duration: Phaser.Math.Between(500, 900),
      ease: 'Power2',
      onComplete: () => star.destroy(),
    });
  }
}

export function screenShake(scene, intensity = 8, duration = 280) {
  scene.cameras.main.shake(duration, intensity / 1000);
}

export function flashScreen(scene, color = 0xff0000, alpha = 0.35, duration = 200) {
  const flash = scene.add.rectangle(
    scene.cameras.main.scrollX + scene.scale.width / 2,
    scene.cameras.main.scrollY + scene.scale.height / 2,
    scene.scale.width,
    scene.scale.height,
    color,
    alpha
  );
  flash.setDepth(199);
  scene.tweens.add({
    targets: flash,
    alpha: 0,
    duration,
    ease: 'Power2',
    onComplete: () => flash.destroy(),
  });
}

export function spawnFloatingText(scene, x, y, text, color = '#4fffb0', size = 22) {
  const t = scene.add.text(x, y, text, {
    fontSize: `${size}px`,
    fontFamily: 'Arial Black, sans-serif',
    color,
    stroke: '#000000',
    strokeThickness: 3,
  });
  t.setOrigin(0.5);
  t.setDepth(45);

  scene.tweens.add({
    targets: t,
    y: y - 65,
    alpha: 0,
    scale: 1.4,
    duration: 900,
    ease: 'Power2',
    onComplete: () => t.destroy(),
  });
}

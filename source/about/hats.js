(() => {
  'use strict';

  const upperHatPoses = [
    { offset: -0.035, rotation: -6 },
    { offset: 0.025, rotation: 4 },
    { offset: -0.012, rotation: -3 }
  ];

  for (const stack of document.querySelectorAll('.profile-hats')) {
    const labels = JSON.parse(stack.dataset.hats);
    const hats = document.createDocumentFragment();

    labels.forEach((label, index) => {
      const hat = document.createElement('li');
      hat.className = 'profile-hat';
      hat.style.setProperty('--hat-index', index);
      hat.style.zIndex = labels.length - index;

      // Anchor the bottom hat to the avatar; arrange the others from the bottom up.
      const level = labels.length - index - 1;
      if (level > 0) {
        const pose = upperHatPoses[(level - 1) % upperHatPoses.length];
        hat.style.setProperty('--hat-offset', pose.offset);
        hat.style.setProperty('--hat-rotation', `${pose.rotation}deg`);
      }

      const text = document.createElement('span');
      text.className = 'profile-hat-label';
      text.textContent = label;
      hat.append(text);
      hats.append(hat);
    });

    stack.replaceChildren(hats);
  }
})();

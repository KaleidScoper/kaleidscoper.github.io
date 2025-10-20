(function(){
  function clampPercent(n){
    if(!isFinite(n) || n < 0) return 0;
    if(n > 100) return 100;
    return Math.round(n);
  }

  function computeStats(){
    var cards = document.querySelectorAll('.grid .card');
    var male = 0, female = 0; // 'na' 不参与统计
    cards.forEach(function(card){
      var g = (card.getAttribute('data-gender')||'na').toLowerCase();
      if(g === 'male' || g === '男') male++;
      else if(g === 'female' || g === '女') female++;
    });
    var effective = male + female;
    var pctMale = effective ? (male / effective * 100) : 0;
    var pctFemale = effective ? (female / effective * 100) : 0;
    return {
      pctMale: clampPercent(pctMale),
      pctFemale: clampPercent(pctFemale),
      male: male,
      female: female,
      effective: effective
    };
  }

  function render(stats){
    var pctMaleEl = document.getElementById('pct-male');
    var pctFemaleEl = document.getElementById('pct-female');
    var barMale = document.getElementById('bar-male');
    var barFemale = document.getElementById('bar-female');
    var badge = document.getElementById('status-badge');

    if(pctMaleEl) pctMaleEl.textContent = stats.pctMale + '%';
    if(pctFemaleEl) pctFemaleEl.textContent = stats.pctFemale + '%';
    if(barMale) barMale.style.width = stats.pctMale + '%';
    if(barFemale) barFemale.style.width = stats.pctFemale + '%';

    if(badge){
      if(stats.pctMale > 50){
        badge.textContent = '检测到性取向故障';
        badge.classList.remove('ok');
        badge.classList.add('error');
      } else {
        badge.textContent = '性取向正常';
        badge.classList.remove('error');
        badge.classList.add('ok');
      }
    }
  }

  function init(){
    render(computeStats());
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();



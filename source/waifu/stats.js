(function () {
  var cards = document.querySelectorAll('.grid .card');
  var male = 0, female = 0;
  cards.forEach(function (card) {
    var g = (card.getAttribute('data-gender') || 'na').toLowerCase();
    if (g === 'male') male++;
    else if (g === 'female') female++;
  });

  var total = male + female;
  var pctFemale = total ? Math.round(female / total * 100) : 0;
  var pctMale = total ? 100 - pctFemale : 0;

  document.getElementById('pct-female').textContent = pctFemale + '%';
  document.getElementById('pct-male').textContent = pctMale + '%';
  document.getElementById('bar-female').style.width = pctFemale + '%';
  document.getElementById('bar-male').style.width = pctMale + '%';

  var badge = document.getElementById('status-badge');
  if (pctMale > 50) {
    badge.textContent = '检测到性取向故障';
    badge.className = 'status-badge error';
  } else {
    badge.textContent = '性取向正常';
    badge.className = 'status-badge ok';
  }
})();

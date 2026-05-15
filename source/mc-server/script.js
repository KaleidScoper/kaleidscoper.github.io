/* mc-server page scripts */

function mobile_navbar_link_hider() {
  var x = document.getElementById("mobile_navbar_links");
  if (x.style.display === "flex") {
    x.style.display = "none";
  } else {
    x.style.display = "flex";
  }
}

function copyText() {
  navigator.clipboard.writeText("qm.rainplay.cn:54318");
}

/* ── Team Members Renderer ── */

function escapeHtml(str) {
  var el = document.createElement("span");
  el.appendChild(document.createTextNode(str));
  return el.innerHTML;
}

function hexToRgba(hex, alpha) {
  var r = parseInt(hex.slice(1, 3), 16);
  var g = parseInt(hex.slice(3, 5), 16);
  var b = parseInt(hex.slice(5, 7), 16);
  return "rgba(" + r + ", " + g + ", " + b + ", " + alpha + ")";
}

function renderTeamMembers() {
  var grid = document.querySelector(".team-grid");
  if (!grid || typeof TEAM_MEMBERS === "undefined") return;

  var fragment = document.createDocumentFragment();

  TEAM_MEMBERS.forEach(function (m) {
    var card = document.createElement("div");
    card.className = "team-card";

    var c = m.color || "#80cfff";
    card.style.setProperty("--card-color", c);
    card.style.setProperty("--card-border", hexToRgba(c, 0.15));
    card.style.setProperty("--card-border-hover", hexToRgba(c, 0.4));
    card.style.setProperty("--card-glow", hexToRgba(c, 0.06));

    var fallbackAttr = m.fallback
      ? " onerror=\"this.onerror=null;this.src='" + escapeHtml(m.fallback) + "'\""
      : "";

    var descHtml = escapeHtml(m.description || "").replace(/\n/g, "<br>");

    var nameHtml = m.link
      ? '<a href="' + escapeHtml(m.link) + '" class="team-card__name team-card__name--link">' + escapeHtml(m.id) + "</a>"
      : '<span class="team-card__name">' + escapeHtml(m.id) + "</span>";

    card.innerHTML =
      '<img src="https://mc-heads.net/body/' + encodeURIComponent(m.id) + '/128"' +
      fallbackAttr +
      ' alt="' + escapeHtml(m.id) + '"' +
      ' class="team-card__avatar"' +
      ' title="' + escapeHtml(m.id) + '">' +
      '<div class="team-card__info">' +
        '<div class="member-titles">' +
          '<span class="member-role" style="color:' + c + '">' + escapeHtml(m.role) + "</span>" +
          '<span class="member-tag">' + escapeHtml(m.tag) + "</span>" +
        "</div>" +
        nameHtml +
        '<p class="team-card__desc">' + descHtml + "</p>" +
      "</div>";

    fragment.appendChild(card);
  });

  grid.appendChild(fragment);
}

/* ── Initialization ── */

$(document).ready(function () {
  $(".main1_ipcopier").click(function () {
    var popup = $("<div>", { class: "main1_popup" }).append(
      $('<h3 class="copy_confirm">').text("已复制 IP 到剪贴板")
    );
    $(this).after(popup);
    setTimeout(function () {
      popup.remove();
    }, 1000);
  });
});

document.addEventListener("DOMContentLoaded", function () {
  var scrollLinks = document.querySelectorAll(".scroll");
  scrollLinks.forEach(function (link) {
    link.addEventListener("click", function (event) {
      event.preventDefault();
      var target = document.querySelector(link.getAttribute("href"));
      if (target) {
        window.scrollTo({
          top: target.offsetTop,
          behavior: "smooth",
        });
      }
    });
  });

  renderTeamMembers();

  var teamObserver = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("team-visible");
          teamObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );
  document
    .querySelectorAll(".team-card, .team-recruit")
    .forEach(function (el, i) {
      el.style.transitionDelay = i * 0.08 + "s";
      teamObserver.observe(el);
    });

  var chatCopyButton = document.getElementById("main4_chat_copy_button");
  if (chatCopyButton) {
    chatCopyButton.addEventListener("click", function (event) {
      event.preventDefault();
      navigator.clipboard.writeText("kaleided.scoper@gmail.com");
      var popup = document.createElement("div");
      popup.className = "main4_popup";
      popup.innerHTML = '<h3 class="copy_confirm">已复制邮箱地址</h3>';
      chatCopyButton.appendChild(popup);
      setTimeout(function () {
        popup.remove();
      }, 1000);
    });
  }
});

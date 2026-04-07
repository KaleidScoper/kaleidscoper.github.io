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
  navigator.clipboard.writeText("t3-2.yxsjmc.cn:20536");
}

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

(function () {
  const container = document.getElementById("newsWidget");
  if (!container) return;

  fetch("https://news1.kz/api/widget-news")
    .then((res) => res.json())
    .then((news) => {
      if (!news.length) {
        container.innerHTML = "Нет новостей";
        return;
      }

      let html = '<ul style="list-style:none;padding:0;margin:0;">';
      news.forEach((item) => {
        html += `
          <li style="margin-bottom:10px;display:flex;align-items:center;">
            <a href="${item.url}" target="_blank" style="text-decoration:none;color:black;display:flex;align-items:center;">
              <img src="${item.image}" alt="${item.title}" style="width:80px;height:50px;object-fit:cover;margin-right:10px;border-radius:4px;">
              <span style="font-size:14px;line-height:1.2;">${item.title}</span>
            </a>
          </li>
        `;
      });
      html += '</ul>';
      container.innerHTML = html;
    })
    .catch((err) => {
      console.error("Ошибка загрузки новостей:", err);
      container.innerHTML = "Ошибка загрузки";
    });
})();

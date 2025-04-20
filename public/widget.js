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

      // Обрезаем до 5 новостей
      news = news.slice(0, 5);

      const style = `
        <style>
          .nw-carousel {
            display: flex;
            overflow-x: auto;
            gap: 16px;
            padding: 8px 0;
            scrollbar-width: none;
          }
          .nw-carousel::-webkit-scrollbar {
            display: none;
          }
          .nw-item {
            flex: 0 0 auto;
            width: 240px;
            background: #fff;
            border-radius: 10px;
            box-shadow: 0 0 8px rgba(0,0,0,0.05);
            overflow: hidden;
            text-decoration: none;
            color: #111;
            display: flex;
            flex-direction: column;
            transition: transform 0.2s ease;
          }
          .nw-item:hover {
            transform: translateY(-2px);
          }
          .nw-img {
            width: 100%;
            height: 140px;
            object-fit: cover;
          }
          .nw-title {
            font-size: 14px;
            padding: 10px;
            line-height: 1.4;
            font-weight: 500;
          }

          @media (max-width: 768px) {
            .nw-item {
              width: 180px;
            }
            .nw-img {
              height: 110px;
            }
            .nw-title {
              font-size: 13px;
              padding: 8px;
            }
          }
        </style>
      `;

      let html = `${style}<div class="nw-carousel">`;

      news.forEach((item) => {
        html += `
          <a href="${item.url}" target="_blank" class="nw-item">
            <img class="nw-img" src="${item.image}" alt="${item.title}" />
            <div class="nw-title">${item.title}</div>
          </a>
        `;
      });

      html += "</div>";
      container.innerHTML = html;
    })
    .catch((err) => {
      console.error("Ошибка загрузки новостей:", err);
      container.innerHTML = "Ошибка загрузки";
    });
})();

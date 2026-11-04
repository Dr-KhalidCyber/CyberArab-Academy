    const courses = {
      network: "أساسيات الشبكات",
      python: "بايثون للمبتدئين",
      cyber: "أساسيات الأمن السيبراني"
    };

    function openCourse(id) {
      const container = document.getElementById("lessons");
      container.replaceChildren();
      const title = document.createElement("h2");
      title.textContent = courses[id];
      container.appendChild(title);

      for (let i = 1; i <= 10; i++) {
        const p = document.createElement("p");
        p.textContent = `الدرس ${i} — سيتم إضافة المحتوى والاختبار`;
        container.appendChild(p);
      }
      container.scrollIntoView({ behavior: "smooth" });
    }
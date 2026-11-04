
/*
 * CyberArab Academy
 * نظام حفظ التقدم وفتح الدروس
 *
 * درجة النجاح: 80%
 * يحفظ النتائج في localStorage
 *
 * عند إضافة درس جديد:
 * أضف اسم ملفه إلى LESSON_PAGES.
 */

(() => {
  "use strict";

  // ==========================================
  // 1. قائمة الدروس بالترتيب
  // ==========================================

  const LESSON_PAGES = [
    "network-lesson.html",
    "network-lesson-2.html",
    "network-lesson-3.html",
    "network-lesson-4.html",
    "network-lesson-5.html",
     "network-lesson-6.html",
    "network-lesson-7.html"
  ];

  const PASS_PERCENT = 80;

  // الحفاظ على طريقة التخزين القديمة
  // الدرجات محفوظة من 20
  const PASS_SCORE = 16;

  const currentFile = decodeURIComponent(
    window.location.pathname.split("/").pop()
  );

  const currentIndex = LESSON_PAGES.indexOf(currentFile);

  const storageKey = (number) =>
    `cyberarab_lesson${number}_score`;

  // ==========================================
  // 2. التحقق من نجاح المتعلم
  // ==========================================

  function hasPassed(lessonNumber) {
    const saved = localStorage.getItem(
      storageKey(lessonNumber)
    );

    if (saved === null) return false;

    const score = Number(saved);

    return Number.isFinite(score) &&
           score >= PASS_SCORE;
  }

  // ==========================================
  // 3. حفظ نتيجة الاختبار
  // ==========================================

  function saveResult() {
    if (currentIndex < 0) return;

    const resultElement = document.getElementById(
      currentIndex === 0 ? "score" : "result"
    );

    if (!resultElement) return;

    const text = resultElement.textContent || "";

    const match = text.match(
      /(?:نتيجتك|النتيجة)\s*:\s*(\d+)\s*\/\s*(\d+)/
    );

    if (!match) return;

    const correctAnswers = Number(match[1]);
    const totalQuestions = Number(match[2]);

    if (
      !Number.isFinite(correctAnswers) ||
      !Number.isFinite(totalQuestions) ||
      totalQuestions <= 0 ||
      correctAnswers < 0 ||
      correctAnswers > totalQuestions
    ) {
      return;
    }

    // تحويل النتيجة إلى مقياس من 20
    const normalizedScore = Math.round(
      (correctAnswers / totalQuestions) * 20
    );

    const lessonNumber = currentIndex + 1;

    // الاحتفاظ بأعلى نتيجة حققها المتعلم
    const previous = Number(
      localStorage.getItem(storageKey(lessonNumber))
    );

    const bestScore = Math.max(
      Number.isFinite(previous) ? previous : 0,
      normalizedScore
    );

    localStorage.setItem(
      storageKey(lessonNumber),
      String(bestScore)
    );

    refreshProgress();
  }

  // ==========================================
  // 4. تحديث الأقفال والتقدم
  // ==========================================

  function refreshProgress() {
    document.querySelectorAll("[data-lock]").forEach(
      (link) => {
        const lessonNumber = Number(
          link.dataset.lock
        );

        const unlocked =
          lessonNumber === 1 ||
          hasPassed(lessonNumber - 1);

        link.classList.toggle(
          "locked",
          !unlocked
        );

        link.setAttribute(
          "aria-disabled",
          String(!unlocked)
        );

        link.title = unlocked
          ? "افتح الدرس"
          : "اجتز اختبار الدرس السابق بنسبة 80% أولًا";
      }
    );

    const completed = LESSON_PAGES.filter(
      (_, index) => hasPassed(index + 1)
    ).length;

    const total = LESSON_PAGES.length;

    const percentage = Math.round(
      (completed / total) * 100
    );

    const countElement = document.querySelector(
      "[data-progress-count]"
    );

    if (countElement) {
      countElement.textContent =
        `${completed} من ${total} دروس مجتازة`;
    }

    const progressBar = document.querySelector(
      "[data-progress-bar]"
    );

    if (progressBar) {
      progressBar.style.width =
        `${percentage}%`;
    }

    const progressValue = document.querySelector(
      "[data-progress-value]"
    );

    if (progressValue) {
      progressValue.textContent =
        `${percentage}%`;
    }
  }

  // ==========================================
  // 5. حماية الدروس المقفلة
  // ==========================================

  function checkLessonAccess() {
    if (currentIndex <= 0) return true;

    if (hasPassed(currentIndex)) {
      return true;
    }

    alert(
      "🔒 هذا الدرس مقفل. " +
      "اجتز اختبار الدرس السابق بنسبة 80% أولًا."
    );

    window.location.replace(
      LESSON_PAGES[currentIndex - 1]
    );

    return false;
  }

  // ==========================================
  // 6. تشغيل النظام
  // ==========================================

  document.addEventListener(
    "DOMContentLoaded",
    () => {
      refreshProgress();

      if (!checkLessonAccess()) return;

      // منع فتح الدروس المقفلة من البطاقات
      document.addEventListener(
        "click",
        (event) => {
          const link = event.target.closest(
            "[data-lock]"
          );

          if (
            link &&
            link.classList.contains("locked")
          ) {
            event.preventDefault();

            alert(
              "🔒 أكمل اختبار الدرس السابق " +
              "بنسبة 80% أولًا."
            );

            return;
          }

          // تحديث النتيجة بعد التصحيح
          if (
            event.target.closest(
              '#grade, #retry, #reset, [onclick*="grade()"]'
            )
          ) {
            setTimeout(saveResult, 80);
          }
        }
      );

      // مراقبة ظهور نتيجة الاختبار
      if (currentIndex >= 0) {
        const resultElement =
          document.getElementById(
            currentIndex === 0
              ? "score"
              : "result"
          );

        if (resultElement) {
          const observer = new MutationObserver(
            saveResult
          );

          observer.observe(resultElement, {
            childList: true,
            characterData: true,
            subtree: true
          });
        }
      }
    }
  );
})();

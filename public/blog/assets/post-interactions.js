(function () {
  function readQuiz(section) {
    try {
      const quiz = JSON.parse(section.dataset.quiz || "[]");
      return Array.isArray(quiz) ? quiz : [];
    } catch {
      return [];
    }
  }

  function textFor(item, key, fallback = "") {
    return String(item && item[key] ? item[key] : fallback);
  }

  function renderQuiz(section) {
    const quiz = readQuiz(section);
    if (quiz.length === 0) {
      return;
    }

    let current = 0;
    let answered = false;
    const progressEl = section.querySelector("[data-quiz-progress], #quiz-progress");
    const questionEl = section.querySelector("[data-quiz-question], #quiz-question");
    const choicesEl = section.querySelector("[data-quiz-choices], #quiz-choices");
    const feedbackEl = section.querySelector("[data-quiz-feedback], #quiz-feedback");
    const nextBtn = section.querySelector("[data-quiz-next], #quiz-next");
    const correctLabel = section.dataset.correctLabel || "좋아요.";
    const incorrectLabel = section.dataset.incorrectLabel || "다시 보면 좋아요.";
    const nextLabel = section.dataset.nextLabel || "다음 질문";
    const finishLabel = section.dataset.finishLabel || "마무리";
    const completeTitle = section.dataset.completeTitle || "점검 완료";
    const completeMessage = section.dataset.completeMessage || "";

    if (!questionEl || !choicesEl || !feedbackEl || !nextBtn) {
      return;
    }

    function setNextVisible(isVisible) {
      nextBtn.classList.toggle("visible", isVisible);
      if (isVisible) {
        nextBtn.style.display = "inline-block";
        return;
      }
      nextBtn.style.removeProperty("display");
    }

    function updateQuestion() {
      const item = quiz[current];
      answered = false;
      if (progressEl) {
        progressEl.textContent = `${current + 1} / ${quiz.length}`;
      }
      const question = textFor(item, "question");
      questionEl.textContent = section.dataset.numberedQuestions === "true"
        ? `질문 ${current + 1} / ${quiz.length}. ${question}`
        : question;
      choicesEl.textContent = "";
      feedbackEl.textContent = "";
      feedbackEl.className = "feedback";
      setNextVisible(false);
      nextBtn.disabled = true;
      nextBtn.textContent = current === quiz.length - 1 ? finishLabel : nextLabel;

      (Array.isArray(item.choices) ? item.choices : []).forEach((choice, index) => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "choice";
        button.textContent = String(choice);
        button.addEventListener("click", () => choose(index));
        choicesEl.appendChild(button);
      });
    }

    function choose(index) {
      if (answered) {
        return;
      }
      answered = true;
      const item = quiz[current];
      const answer = Number(item.answer);
      const buttons = Array.from(choicesEl.querySelectorAll(".choice"));
      buttons.forEach((button, buttonIndex) => {
        button.disabled = true;
        if (buttonIndex === answer) {
          button.classList.add("correct");
        }
        if (buttonIndex === index && buttonIndex !== answer) {
          button.classList.add(section.dataset.incorrectClass || "incorrect");
        }
      });

      const isCorrect = index === answer;
      const explanation = textFor(item, "explanation", textFor(item, "explain"));
      feedbackEl.textContent = `${isCorrect ? correctLabel : incorrectLabel} ${explanation}`.trim();
      feedbackEl.className = `feedback visible ${isCorrect ? "ok" : "bad"}`.trim();
      nextBtn.disabled = false;
      setNextVisible(true);
    }

    nextBtn.addEventListener("click", () => {
      if (!answered) {
        return;
      }
      if (current < quiz.length - 1) {
        current += 1;
        updateQuestion();
        return;
      }
      if (progressEl) {
        progressEl.textContent = "완료";
      }
      questionEl.textContent = completeTitle;
      choicesEl.textContent = "";
      feedbackEl.textContent = completeMessage;
      feedbackEl.className = completeMessage ? "feedback visible" : "feedback";
      nextBtn.disabled = true;
      setNextVisible(false);
      nextBtn.textContent = "완료";
    });

    updateQuestion();
  }

  function setupCheckpoint(section) {
    const toggle = section.querySelector("[data-checkpoint-toggle], #checkpoint-toggle");
    const answer = section.querySelector("[data-checkpoint-answer], #checkpoint-answer");
    if (!toggle || !answer) {
      return;
    }

    toggle.addEventListener("click", () => {
      const className = section.dataset.openClass || "open";
      const isOpen = answer.classList.toggle(className);
      if (isOpen && getComputedStyle(answer).display === "none") {
        answer.style.display = "block";
      } else if (!isOpen) {
        answer.style.removeProperty("display");
      }
      toggle.setAttribute("aria-expanded", String(isOpen));
      toggle.textContent = isOpen
        ? section.dataset.closeLabel || "해설 접기"
        : section.dataset.openLabel || "해설 보기";
    });
  }

  document.querySelectorAll(".quiz[data-quiz]").forEach(renderQuiz);
  document.querySelectorAll(".checkpoint").forEach(setupCheckpoint);
})();

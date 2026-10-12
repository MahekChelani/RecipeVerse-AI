import { useState } from "react";

const questions = [
  {
    question: "Which languages does RecipeVerse AI support?",
    answer:
      "The interface is currently in English, while the recipe catalog includes dishes from cuisines around the world. Translated interface content is not currently available.",
  },
  {
    question: "How does the AI Cooking Assistant work?",
    answer:
      "The cooking guide demo shows a recipe's existing instructions one step at a time. It does not currently use speech recognition, voice playback, or generated AI responses.",
  },
  {
    question: "Can I scan ingredients using my camera?",
    answer:
      "You can select a kitchen photo to preview it and enter ingredients manually to find matching catalog recipes. Automatic image recognition is not enabled.",
  },
  {
    question: "Does RecipeVerse AI provide nutrition information?",
    answer:
      "Nutrition information is not included in the current recipe catalog, so the app does not provide nutrition estimates.",
  },
];

function FAQ() {
  const [openQuestion, setOpenQuestion] = useState(null);

  return (
    <section className="max-w-4xl mx-auto py-16 px-6">
      <h1 className="text-3xl font-bold text-center mb-10">
        Frequently Asked Questions
      </h1>

      <div className="space-y-4">
        {questions.map(({ question, answer }, index) => {
          const isOpen = openQuestion === index;
          const answerId = `faq-answer-${index}`;

          return (
            <div
              key={question}
              className="rounded-xl bg-white p-5 shadow-md transition hover:shadow-lg"
            >
              <button
                type="button"
                aria-expanded={isOpen}
                aria-controls={answerId}
                onClick={() => setOpenQuestion(isOpen ? null : index)}
                className="flex w-full items-center justify-between gap-4 text-left font-semibold text-gray-900"
              >
                <span>{question}</span>
                <span
                  aria-hidden="true"
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-orange-100 text-lg font-bold text-orange-700"
                >
                  {isOpen ? "−" : "+"}
                </span>
              </button>
              <div
                id={answerId}
                hidden={!isOpen}
                className="mt-4 border-t border-gray-100 pt-4 leading-7 text-gray-600"
              >
                {answer}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default FAQ;

import { useState } from "react";
import {
  ArrowRight,
  ArrowLeft,
  Bot,
  Check,
  LoaderCircle,
  PackageSearch,
  Sparkles,
} from "lucide-react";

import { api } from "../services/api";
import LocationPicker from "./LocationPicker";

const MAX_QUESTIONS = 6;

export default function DiscoveryForm({ onComplete }) {
  const [product, setProduct] = useState("");
  const [category, setCategory] = useState("");
  const [location, setLocation] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const [question, setQuestion] = useState(null);
  const [answer, setAnswer] = useState("");
  const [questionCount, setQuestionCount] = useState(0);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const started = Boolean(sessionId && question);
  const progress = started
    ? Math.min((questionCount / MAX_QUESTIONS) * 100, 100)
    : 0;

  async function handleStart(event) {
    event.preventDefault();
    setError("");

    if (!product.trim()) {
      setError("Enter the product or material you need.");
      return;
    }

    if (!location) {
      setError("Choose live location or enter a location manually.");
      return;
    }

    if (
      location.mode === "typed" &&
      !location.address?.trim()
    ) {
      setError("Enter a city, area, PIN code, or address.");
      return;
    }

    setLoading(true);

    try {
      const startedSession = await api.startSession({
        product: product.trim(),
        category: category.trim() || null,
      });

      setSessionId(startedSession.session_id);

      try {
        await api.saveLocation(
          startedSession.session_id,
          location
        );
      } catch (locationError) {
        // Do not silently claim the location was saved.
        throw new Error(
          `Your session started, but saving the location failed: ${locationError.message}`
        );
      }

      if (startedSession.complete) {
        onComplete({
          ...startedSession,
          location,
        });
        return;
      }

      setQuestion(startedSession.question);
      setQuestionCount(1);
      setAnswers({
        product: product.trim(),
        ...(category.trim() ? { category: category.trim() } : {}),
      });
      setAnswer("");
    } catch (err) {
      setError(err.message || "Unable to start discovery.");
    } finally {
      setLoading(false);
    }
  }

  async function handleAnswer(event) {
    event.preventDefault();
    setError("");

    if (!answer.trim()) {
      setError("Please provide an answer to continue.");
      return;
    }

    if (!question || !sessionId) return;

    setLoading(true);

    try {
      const submittedAnswer = answer.trim();

      const result = await api.submitAnswer({
        session_id: sessionId,
        field: question.field,
        answer: submittedAnswer,
      });

      const updatedAnswers = {
        ...answers,
        [question.field]: submittedAnswer,
      };

      setAnswers(updatedAnswers);

      if (result.complete) {
        onComplete({
          ...result,
          location,
        });
        return;
      }

      const nextQuestion = result.question;

      if (!nextQuestion) {
        throw new Error("The API did not return the next question.");
      }

      // Hard client-side guard. This should not be reached with the
      // current three-field backend questionnaire.
      if (questionCount >= MAX_QUESTIONS) {
        throw new Error(
          "The questionnaire reached its six-question limit. Please update the backend to finish incomplete sessions."
        );
      }

      setQuestion(nextQuestion);
      setQuestionCount((count) => count + 1);
      setAnswer("");
    } catch (err) {
      setError(err.message || "Unable to submit your answer.");
    } finally {
      setLoading(false);
    }
  }

  function resetForm() {
    setProduct("");
    setCategory("");
    setLocation(null);
    setSessionId(null);
    setQuestion(null);
    setAnswer("");
    setQuestionCount(0);
    setAnswers({});
    setError("");
  }

  if (started) {
    return (
      <div className="mx-auto max-w-3xl">
        <button
          type="button"
          onClick={resetForm}
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900"
        >
          <ArrowLeft size={16} />
          Start a new search
        </button>

        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-soft">
          <div className="border-b border-slate-100 p-6 sm:p-8">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                  <Bot size={23} />
                </div>
                <div>
                  <h2 className="font-semibold text-slate-900">
                    AI discovery assistant
                  </h2>
                  <p className="text-sm text-slate-500">
                    Finding the right sourcing requirements
                  </p>
                </div>
              </div>

              <span className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700">
                Question {questionCount} of {MAX_QUESTIONS}
              </span>
            </div>

            <div className="mt-6 h-2 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-blue-600 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <div className="p-6 sm:p-8">
            <div className="mb-6 rounded-2xl bg-slate-50 p-4">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
                Product
              </p>
              <p className="font-semibold text-slate-900">{product}</p>
              {location?.mode === "typed" && (
                <p className="mt-1 text-sm text-slate-500">
                  <span className="font-medium">Search area:</span>{" "}
                  {location.address}
                </p>
              )}
              {location?.mode === "live" && (
                <p className="mt-1 text-sm text-slate-500">
                  Live location selected
                </p>
              )}
            </div>

            <form onSubmit={handleAnswer}>
              <div className="mb-6 flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white">
                  <Sparkles size={18} />
                </div>

                <div className="flex-1 rounded-2xl rounded-tl-sm border border-slate-200 p-4">
                  <p className="text-base font-semibold leading-7 text-slate-900">
                    {question.question}
                  </p>
                  <p className="mt-2 text-xs text-slate-500">
                    Answer only what is needed. No lengthy questionnaire.
                  </p>
                </div>
              </div>

              <label
                htmlFor="discovery-answer"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Your answer
              </label>

              {question.field === "quantity" ||
              question.input_type === "number" ? (
                <input
                  id="discovery-answer"
                  type="number"
                  min="1"
                  step="1"
                  required
                  value={answer}
                  onChange={(event) => setAnswer(event.target.value)}
                  placeholder="Enter quantity"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                />
              ) : (
                <input
                  id="discovery-answer"
                  type="text"
                  required
                  maxLength={1000}
                  value={answer}
                  onChange={(event) => setAnswer(event.target.value)}
                  placeholder={
                    question.field === "price"
                      ? "e.g. ₹300–₹350 per bag"
                      : question.field === "category"
                      ? "e.g. Building materials"
                      : "Type your answer"
                  }
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                />
              )}

              {error && (
                <p role="alert" className="mt-3 text-sm text-red-600">
                  {error}
                </p>
              )}

              <div className="mt-6 flex justify-end">
                <button
                  type="submit"
                  disabled={loading || !answer.trim()}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <LoaderCircle className="animate-spin" size={17} />
                      Processing...
                    </>
                  ) : (
                    <>
                      Continue
                      <ArrowRight size={17} />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-8">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700">
          <Sparkles size={14} />
          AI-powered sourcing
        </div>

        <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          What are you looking to source?
        </h2>

        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
          Tell us what you need and where to find it. SupplyMind will
          collect only the essential details before preparing your
          product search.
        </p>
      </div>

      <form onSubmit={handleStart} className="space-y-5">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft sm:p-6">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <PackageSearch size={21} />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">
                Product requirements
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                Start with the product or material name.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label
                htmlFor="product"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Product or material <span className="text-red-500">*</span>
              </label>
              <input
                id="product"
                required
                minLength={2}
                maxLength={200}
                value={product}
                onChange={(event) => setProduct(event.target.value)}
                placeholder="e.g. Cement, TMT bars, bricks, plywood"
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
              />
            </div>

            <div>
              <label
                htmlFor="category"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Category <span className="text-slate-400">(optional)</span>
              </label>
              <input
                id="category"
                maxLength={200}
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                placeholder="e.g. Building materials"
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
              />
              <p className="mt-2 text-xs text-slate-500">
                Leave this blank if you want the assistant to ask.
              </p>
            </div>
          </div>
        </section>

        <LocationPicker value={location} onChange={setLocation} />

        {error && (
          <div
            role="alert"
            className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          >
            {error}
          </div>
        )}

        <div className="flex flex-col justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5 sm:flex-row sm:items-center sm:p-6">
          <div>
            <p className="text-sm font-semibold text-slate-900">
              Short and focused
            </p>
            <p className="mt-1 text-sm text-slate-500">
              Up to 6 questions. Location is collected separately.
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/15 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? (
              <>
                <LoaderCircle className="animate-spin" size={18} />
                Starting...
              </>
            ) : (
              <>
                Start discovery
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
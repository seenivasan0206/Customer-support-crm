import React, { useCallback, useEffect, useRef, useState } from "react";

import "./KnowledgeBase.css";
import { filterArticles, mergeById } from "./knowledgeBaseUtils";

const apiBase = (
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api"
).replace(/\/$/, "");
const articlesUrl = `${apiBase}/knowledge/articles/`;
const categoriesUrl = `${apiBase}/knowledge/categories/`;

async function request(url, options = {}) {
  let response;
  try {
    response = await fetch(url, options);
  } catch (error) {
    if (error.name === "AbortError") throw error;
    throw new Error(
      "Cannot reach the knowledge base service. Please try again when it is available.",
    );
  }
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    const details =
      data && typeof data === "object"
        ? Object.entries(data)
            .map(
              ([field, value]) =>
                `${field}: ${Array.isArray(value) ? value.join(", ") : value}`,
            )
            .join(" ")
        : "";
    throw new Error(
      response.status >= 500
        ? "The knowledge base service is unavailable. Please try again later."
        : details || `Request failed (${response.status}).`,
    );
  }
  if (response.status === 204) return null;
  if (!data)
    throw new Error(
      "The knowledge base service returned an unexpected response.",
    );
  return data;
}

async function fetchArticles(signal, url = articlesUrl) {
  const data = await request(url, { method: "GET", signal });
  const articles = Array.isArray(data) ? data : data.results;
  if (!Array.isArray(articles))
    throw new Error("The article service returned an unexpected article list.");
  return { articles, next: Array.isArray(data) ? null : data.next };
}

async function fetchCategories(signal, url = categoriesUrl) {
  const data = await request(url, { method: "GET", signal });
  const categories = Array.isArray(data) ? data : data.results;
  if (!Array.isArray(categories))
    throw new Error("The service returned an unexpected category list.");
  return { categories, next: Array.isArray(data) ? null : data.next };
}

function createArticle(title, content, summary, category, status, slug, author, signal) {
  return request(articlesUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    signal,
    body: JSON.stringify({
      title,
      content,
      summary: summary.trim(),
      category: category || null,
      slug: slug.trim(),
      author: author === "" ? null : Number(author),
      status,
    }),
  });
}

function saveCategory(id, name, description, signal) {
  return request(
    id === null ? categoriesUrl : `${categoriesUrl}${encodeURIComponent(id)}/`,
    {
      method: id === null ? "POST" : "PATCH",
      headers: { "Content-Type": "application/json" },
      signal,
      body: JSON.stringify({
        name: name.trim(),
        description: description.trim(),
      }),
    },
  );
}

function KnowledgeCategories({ onSaved, onLoaded }) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [nextPage, setNextPage] = useState(null);
  const requestRef = useRef(null);
  const saveRef = useRef(null);
  const nameRef = useRef(null);
  const [editingId, setEditingId] = useState(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    onLoaded(categories);
  }, [categories, onLoaded]);

  const resetForm = () => {
    setEditingId(null);
    setName("");
    setDescription("");
    setSaveError("");
  };

  const editCategory = (category) => {
    setEditingId(category.id);
    setName(category.name);
    setDescription(category.description || "");
    setSaveError("");
    setMessage("");
    nameRef.current?.focus();
  };

  const loadCategories = useCallback(async (url) => {
    requestRef.current?.abort();
    const controller = new AbortController();
    requestRef.current = controller;
    setLoading(true);
    setError("");
    try {
      const result = await fetchCategories(controller.signal, url);
      if (controller.signal.aborted) return;
      setCategories((previous) =>
        url ? mergeById(previous, result.categories) : result.categories,
      );
      setNextPage(result.next);
    } catch (failure) {
      if (!controller.signal.aborted) setError(failure.message);
    } finally {
      if (!controller.signal.aborted) setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCategories();
    return () => {
      requestRef.current?.abort();
      saveRef.current?.abort();
    };
  }, [loadCategories]);

  const submitCategory = async (event) => {
    event.preventDefault();
    if (saveRef.current) return;
    setSaveError("");
    setMessage("");
    if (!name.trim() || name.trim().length > 100) {
      setSaveError("Enter a category name between 1 and 100 characters.");
      nameRef.current?.focus();
      return;
    }
    if (
      categories.some(
        (item) =>
          item.id !== editingId &&
          item.name.trim().toLowerCase() === name.trim().toLowerCase(),
      )
    ) {
      setSaveError("A category with this name already exists.");
      nameRef.current?.focus();
      return;
    }
    const controller = new AbortController();
    saveRef.current = controller;
    setSaving(true);
    try {
      await saveCategory(editingId, name, description, controller.signal);
      if (controller.signal.aborted) return;
      setMessage(editingId === null ? "Category added." : "Category updated.");
      resetForm();
      loadCategories();
      onSaved?.();
    } catch (failure) {
      if (!controller.signal.aborted) setSaveError(failure.message);
    } finally {
      saveRef.current = null;
      if (!controller.signal.aborted) setSaving(false);
    }
  };

  const deleteCategory = async (id) => {
    if (saveRef.current) return;
    const controller = new AbortController();
    saveRef.current = controller;
    setSaving(true);
    setSaveError("");
    setMessage("");
    try {
      await request(`${categoriesUrl}${encodeURIComponent(id)}/`, {
        method: "DELETE",
        signal: controller.signal,
      });
      if (controller.signal.aborted) return;
      setDeletingId(null);
      if (editingId === id) resetForm();
      setMessage("Category deleted. Its articles are now uncategorized.");
      loadCategories();
      onSaved?.(id);
    } catch (failure) {
      if (!controller.signal.aborted) setSaveError(failure.message);
    } finally {
      saveRef.current = null;
      if (!controller.signal.aborted) setSaving(false);
    }
  };
  const visibleCategories = categories.filter((item) =>
    `${item.name} ${item.description || ""}`
      .toLowerCase()
      .includes(search.trim().toLowerCase()),
  );

  return (
    <section
      className="article-feed knowledge-categories"
      aria-labelledby="categories-title"
      aria-busy={loading}
    >
      <div className="article-feed__header">
        <div>
          <span className="article-writer__eyebrow">BROWSE BY TOPIC</span>
          <h3 id="categories-title">Categories</h3>
        </div>
        <button
          type="button"
          disabled={loading}
          onClick={() => loadCategories()}
          aria-label="Refresh categories"
        >
          Refresh
        </button>
      </div>
      <form
        className="category-form"
        onSubmit={submitCategory}
        aria-labelledby="category-form-title"
        aria-busy={saving}
      >
        <h4 id="category-form-title">
          {editingId === null ? "Add category" : "Edit category"}
        </h4>
        <div className="category-form__fields">
          <div>
            <label htmlFor="category-name">
              Category name <span>(required)</span>
            </label>
            <input
              id="category-name"
              ref={nameRef}
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
              maxLength={100}
              disabled={saving}
              placeholder="e.g. Getting started"
            />
          </div>
          <div>
            <label htmlFor="category-description">
              Description <span>(optional)</span>
            </label>
            <textarea
              id="category-description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              disabled={saving}
              rows={3}
              placeholder="What topics does this category cover?"
            />
          </div>
        </div>
        {saveError && (
          <p className="article-writer__error" role="alert">
            {saveError}
          </p>
        )}
        <div className="category-form__actions">
          <button type="submit" disabled={saving}>
            {saving
              ? "Saving…"
              : editingId === null
                ? "Add category"
                : "Save changes"}
          </button>
          {editingId !== null && (
            <button
              type="button"
              disabled={saving}
              onClick={() => {
                resetForm();
                setMessage("");
              }}
            >
              Cancel
            </button>
          )}
        </div>
        {message && (
          <p className="article-writer__status" role="status">
            {message}
          </p>
        )}
      </form>
      {error && (
        <p className="article-writer__error" role="alert">
          {error}
        </p>
      )}
      {loading && <p role="status">Loading categories…</p>}
      {!loading && !error && categories.length === 0 && (
        <div className="article-feed__empty">
          <h4>No categories yet</h4>
          <p>Categories will appear here when they are available.</p>
        </div>
      )}
      <label className="article-writer__label" htmlFor="category-search">
        Search categories
      </label>
      <input
        id="category-search"
        className="article-writer__title"
        type="search"
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        placeholder="Search name or description"
      />
      {nextPage && (
        <p>
          Search covers loaded categories. Load more to include the next page.
        </p>
      )}
      {!loading &&
        !error &&
        categories.length > 0 &&
        visibleCategories.length === 0 && (
          <p role="status">No loaded categories match your search.</p>
        )}
      <div className="knowledge-categories__grid">
        {visibleCategories.map((category) => (
          <article className="article-feed__card" key={category.id}>
            <h4>{category.name}</h4>
            {category.created_at && (
              <div className="article-feed__meta">
                <time dateTime={category.created_at}>
                  Created {new Date(category.created_at).toLocaleDateString()}
                </time>
              </div>
            )}
            {category.description && (
              <p className="knowledge-categories__description">
                {category.description}
              </p>
            )}
            <button
              type="button"
              disabled={saving}
              onClick={() => editCategory(category)}
              aria-label={`Edit category ${category.name}`}
            >
              Edit
            </button>
            <div className="category-form__actions">
              {deletingId === category.id ? (
                <div
                  role="group"
                  aria-label={`Confirm deletion of ${category.name}`}
                >
                  <p>
                    Delete “{category.name}”? Existing articles will be kept and
                    become uncategorized. This cannot be undone.
                  </p>
                  <div className="category-form__actions">
                    <button
                      type="button"
                      disabled={saving}
                      onClick={() => deleteCategory(category.id)}
                    >
                      Confirm delete
                    </button>
                    <button
                      type="button"
                      disabled={saving}
                      onClick={() => setDeletingId(null)}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => setDeletingId(category.id)}
                >
                  Delete category
                </button>
              )}
            </div>
          </article>
        ))}
      </div>
      {nextPage && (
        <button
          className="article-feed__more"
          type="button"
          disabled={loading}
          onClick={() => loadCategories(nextPage)}
        >
          Load more categories
        </button>
      )}
    </section>
  );
}

function CategorySelect({
  id,
  categories,
  value,
  onChange,
  disabled,
  all = false,
}) {
  const missing =
    value &&
    !categories.some((category) => String(category.id) === String(value));
  return (
    <>
      <label className="article-writer__label" htmlFor={id}>
        Category
      </label>
      <select
        id={id}
        className="article-writer__title"
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
      >
        <option value="">{all ? "All categories" : "Uncategorized"}</option>
        {missing && <option value={value}>Current category ({value})</option>}
        {categories.map((category) => (
          <option key={category.id} value={category.id}>
            {category.name}
          </option>
        ))}
      </select>
    </>
  );
}

function ArticleIdentityFields({ prefix, slug, author, onSlugChange, onAuthorChange, disabled }) {
  return (
    <>
      <label className="article-writer__label" htmlFor={prefix + "-slug"}>Slug (required, unique)</label>
      <input id={prefix + "-slug"} className="article-writer__title"
        value={slug} onChange={(event) => onSlugChange(event.target.value)}
        required maxLength={50} pattern="[a-zA-Z0-9_\-]+"
        title="Use letters, numbers, underscores or hyphens (maximum 50 characters)."
        placeholder="how-to-reset-your-password" disabled={disabled} />
      <label className="article-writer__label" htmlFor={prefix + "-author"}>Author ID (optional)</label>
      <input id={prefix + "-author"} className="article-writer__title"
        type="number" min="1" step="1" value={author}
        onChange={(event) => onAuthorChange(event.target.value)}
        aria-describedby={prefix + "-author-hint"} disabled={disabled} />
      <p id={prefix + "-author-hint"} className="article-writer__hint">
        Enter an existing user's ID, or leave blank for no author.
      </p>
    </>
  );
}

function ArticleCard({ article, categories, onSaved, onDeleted }) {
  const [draft, setDraft] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const requestRef = useRef(null);

  useEffect(() => () => requestRef.current?.abort(), []);

  const mutate = async (method, fields) => {
    if (requestRef.current) return;
    const controller = new AbortController();
    requestRef.current = controller;
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const updated = await request(
        `${articlesUrl}${encodeURIComponent(article.id)}/`,
        {
          method,
          headers: { "Content-Type": "application/json" },
          signal: controller.signal,
          ...(fields ? { body: JSON.stringify(fields) } : {}),
        },
      );
      if (controller.signal.aborted) return;
      if (method === "DELETE") {
        onDeleted();
      } else {
        onSaved(updated);
        setDraft(null);
        setMessage("Article saved.");
      }
    } catch (failure) {
      if (!controller.signal.aborted) setError(failure.message);
    } finally {
      requestRef.current = null;
      if (!controller.signal.aborted) setBusy(false);
    }
  };

  const save = (event) => {
    event.preventDefault();
    if (!draft.title.trim() || !draft.content.trim()) {
      setError("Enter an article title and content before saving.");
      return;
    }
    mutate("PATCH", {
      ...draft,
      title: draft.title.trim(),
      content: draft.content.trim(),
      summary: draft.summary.trim(),
      category: draft.category || null,
      slug: draft.slug.trim(),
      author: draft.author === "" ? null : Number(draft.author),
    });
  };

  return (
    <article className="article-feed__card" aria-busy={busy}>
      <div className="article-feed__meta">
        <span className={`kb-status kb-status--${article.status}`}>{article.status === "published" ? "Published" : "Draft"}</span>
        <span>{article.category_name || categories.find((item) => String(item.id) === String(article.category))?.name || (article.category == null ? "Uncategorized" : `Category #${article.category}`)}</span>
        {article.author != null && <span>Author #{article.author}</span>}
        {article.created_at && (
          <time dateTime={article.created_at}>
            Created {new Date(article.created_at).toLocaleDateString()}
          </time>
        )}
        {article.updated_at && (
          <time dateTime={article.updated_at}>
            Updated {new Date(article.updated_at).toLocaleDateString()}
          </time>
        )}
      </div>
      <h4>{article.title}</h4>
      {article.slug && <p>Slug: <code>{article.slug}</code></p>}
      {draft ? (
        <form onSubmit={save}>
          <label
            className="article-writer__label"
            htmlFor={`edit-title-${article.id}`}
          >
            Article title
          </label>
          <input
            id={`edit-title-${article.id}`}
            className="article-writer__title"
            value={draft.title}
            required
            maxLength={200}
            disabled={busy}
            autoFocus
            onChange={(event) =>
              setDraft({ ...draft, title: event.target.value })
            }
          />
          <label
            className="article-writer__label"
            htmlFor={`edit-summary-${article.id}`}
          >
            Summary
          </label>
          <textarea
            id={`edit-summary-${article.id}`}
            className="article-writer__title"
            value={draft.summary}
            disabled={busy}
            onChange={(event) =>
              setDraft({ ...draft, summary: event.target.value })
            }
          />
          <ArticleIdentityFields prefix={"edit-article-" + article.id}
            slug={draft.slug} author={draft.author} disabled={busy}
            onSlugChange={(slug) => setDraft({ ...draft, slug })}
            onAuthorChange={(author) => setDraft({ ...draft, author })} />
          <label className="article-writer__label" htmlFor={"edit-status-" + article.id}>Status</label>
          <select id={"edit-status-" + article.id} className="article-writer__title"
            value={draft.status} disabled={busy}
            onChange={(event) => setDraft({ ...draft, status: event.target.value })}>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
          <CategorySelect
            id={`edit-category-${article.id}`}
            categories={categories}
            value={draft.category}
            disabled={busy}
            onChange={(category) => setDraft({ ...draft, category })}
          />
          <label
            className="article-writer__label"
            htmlFor={`edit-content-${article.id}`}
          >
            Content
          </label>
          <textarea
            id={`edit-content-${article.id}`}
            className="article-writer__title"
            rows={8}
            value={draft.content}
            required
            disabled={busy}
            onChange={(event) =>
              setDraft({ ...draft, content: event.target.value })
            }
          />
          <div className="category-form__actions">
            <button type="submit" disabled={busy}>
              {busy ? "Saving…" : "Save changes"}
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => {
                setDraft(null);
                setError("");
              }}
            >
              Cancel
            </button>
          </div>
          <ArticlePreview
            title={draft.title}
            summary={draft.summary}
            content={draft.content}
          />
        </form>
      ) : (
        <>
          {article.summary && <p>{article.summary}</p>}
          <details>
            <summary>Read article</summary>
            <div className="article-feed__content">{article.content}</div>
          </details>
          {confirmDelete ? (
            <div>
              <p>Delete “{article.title}”? This cannot be undone.</p>
              <div className="category-form__actions">
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => mutate("DELETE")}
                >
                  Confirm delete
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => {
                    setConfirmDelete(false);
                    setError("");
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="category-form__actions">
              <button
                type="button"
                disabled={busy}
                onClick={() => {
                  setError("");
                  setMessage("");
                  setDraft({
                    title: article.title,
                    slug: article.slug,
                    author: article.author ?? "",
                    status: article.status,
                    content: article.content,
                    summary: article.summary || "",
                    category: article.category ?? "",
                  });
                }}
              >
                Edit
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={() =>
                  mutate("PATCH", {
                    status:
                      article.status === "published" ? "draft" : "published",
                  })
                }
              >
                {article.status === "published" ? "Move to draft" : "Publish"}
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={() => {
                  setConfirmDelete(true);
                  setMessage("");
                }}
              >
                Delete
              </button>
            </div>
          )}
        </>
      )}
      {error && (
        <p className="article-writer__error" role="alert">
          {error}
        </p>
      )}
      {message && (
        <p className="article-writer__status" role="status">
          {message}
        </p>
      )}
    </article>
  );
}

function ArticlePreview({ title, summary, content }) {
  return (
    <details className="article-feed__card">
      <summary>Preview article</summary>
      <h4>{title.trim() || "Untitled article"}</h4>
      {summary && <p>{summary}</p>}
      <div className="article-feed__content">
        {content || "Your article content will appear here."}
      </div>
    </details>
  );
}

function KnowledgeBase() {
  const [promptMessage, setPromptMessage] = useState("");

  const [submitError, setSubmitError] = useState("");
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [author, setAuthor] = useState("");
  const [summary, setSummary] = useState("");
  const [category, setCategory] = useState("");
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [sort, setSort] = useState("newest");
  const [saveStatus, setSaveStatus] = useState("draft");
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState("");
  const [nextPage, setNextPage] = useState(null);
  const listRequest = useRef(null);
  const saveRequest = useRef(null);

  const loadArticles = useCallback(async (url) => {
    listRequest.current?.abort();
    const controller = new AbortController();
    listRequest.current = controller;
    setLoading(true);
    setListError("");
    try {
      const result = await fetchArticles(controller.signal, url);
      if (controller.signal.aborted) return;
      setArticles((previous) =>
        url ? mergeById(previous, result.articles) : result.articles,
      );
      setNextPage(result.next);
    } catch (error) {
      if (!controller.signal.aborted) setListError(error.message);
    } finally {
      if (!controller.signal.aborted) setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadArticles();
    return () => {
      listRequest.current?.abort();
      saveRequest.current?.abort();
    };
  }, [loadArticles]);

  const send = async (text) => {
    setPromptMessage("");
    setSubmitError("");
    if (!title.trim() || !text.trim()) {
      setSubmitError("Enter an article title and content before submitting.");
      return false;
    }
    if (saveRequest.current) return false;
    const controller = new AbortController();
    saveRequest.current = controller;
    setSaving(true);
    try {
      await createArticle(
        title.trim(),
        text.trim(),
        summary,
        category,
        saveStatus,
        slug,
        author,
        controller.signal,
      );
      if (controller.signal.aborted) return false;
      setTitle("");
      setSlug("");
      setAuthor("");
      setContent("");
      setSummary("");
      setCategory("");
      setPromptMessage(
        saveStatus === "published"
          ? "Article published."
          : "Article saved as a draft.",
      );
      setSaveStatus("draft");
      loadArticles();
      return true;
    } catch (error) {
      if (!controller.signal.aborted) setSubmitError(error.message);
      return false;
    } finally {
      saveRequest.current = null;
      if (!controller.signal.aborted) setSaving(false);
    }
  };

  const visibleArticles = filterArticles(articles, {
    search,
    status,
    category: categoryFilter,
    sort,
  });

  const updateArticleList = (id, updated) => {
    listRequest.current?.abort();
    setLoading(false);
    setArticles((previous) =>
      updated
        ? previous.map((item) => (item.id === id ? updated : item))
        : previous.filter((item) => item.id !== id),
    );
  };

  return (
    <div className="knowledge">
      <header className="kb-heading">
        <span className="article-writer__eyebrow">SUPPORT LIBRARY</span>
        <h2 className="kb-title">Knowledge Base</h2>
        <p>Create helpful articles and organize your team's knowledge by topic.</p>
      </header>
      <dl className="kb-overview" aria-label="Loaded knowledge records">
        <div><dt>Articles loaded</dt><dd>{loading && !articles.length ? "—" : articles.length}</dd><span>Your knowledge library</span></div>
        <div><dt>Published</dt><dd>{loading && !articles.length ? "—" : articles.filter((item) => item.status === "published").length}</dd><span>Ready to share</span></div>
        <div><dt>Drafts</dt><dd>{loading && !articles.length ? "—" : articles.filter((item) => item.status === "draft").length}</dd><span>Work in progress</span></div>
        <div><dt>Categories loaded</dt><dd>{categories.length}</dd><span>Organized by topic</span></div>
      </dl>
      <div className="knowledge-workspace">
        <form
          className="article-writer"
          aria-labelledby="article-writer-title"
          aria-busy={saving}
          onSubmit={(event) => { event.preventDefault(); send(content); }}
        >
          <div className="article-writer__heading">
            <span className="article-writer__eyebrow">ARTICLE WRITER</span>
            <h3 id="article-writer-title">Create an article</h3>
            <p>
              Add a title and write your article below. Choose whether to save a
              draft or publish.
            </p>
          </div>

          <label className="article-writer__label" htmlFor="article-title">
            Article title
          </label>
          <input
            id="article-title"
            className="article-writer__title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            maxLength={200}
            disabled={saving}
            placeholder="e.g. How to reset your password"
            required
          />
          <ArticleIdentityFields prefix="new-article" slug={slug} author={author}
            onSlugChange={setSlug} onAuthorChange={setAuthor} disabled={saving} />
          <label className="article-writer__label" htmlFor="article-summary">
            Summary (optional)
          </label>
          <textarea
            id="article-summary"
            className="article-writer__title"
            rows={2}
            value={summary}
            onChange={(event) => setSummary(event.target.value)}
            disabled={saving}
          />
          <CategorySelect
            id="article-category"
            categories={categories}
            value={category}
            onChange={setCategory}
            disabled={saving}
          />
          <label
            className="article-writer__label"
            htmlFor="article-save-status"
          >
            Save as
          </label>
          <select
            id="article-save-status"
            className="article-writer__title"
            value={saveStatus}
            disabled={saving}
            onChange={(event) => setSaveStatus(event.target.value)}
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
          <label className="article-writer__label" htmlFor="article-content">Article content</label>
          <textarea id="article-content" className="article-writer__title"
            placeholder="Write clear steps and helpful details."
            value={content} onChange={(event) => setContent(event.target.value)}
            rows={10} required disabled={saving} />
          <div className="category-form__actions">
            <button type="submit" disabled={saving}>
              {saving ? "Saving…" : saveStatus === "published" ? "Publish article" : "Save draft"}
            </button>
          </div>
          <ArticlePreview title={title} summary={summary} content={content} />
          {saving && <p role="status">Saving your article…</p>}
          {submitError && (
            <p className="article-writer__error" role="alert">
              {submitError}
            </p>
          )}
          {promptMessage && (
            <p className="article-writer__status" role="status">
              {promptMessage}
            </p>
          )}
        </form>
        <section
          className="article-feed"
          aria-labelledby="article-feed-title"
          aria-busy={loading}
        >
          <div className="article-feed__header">
            <div>
              <span className="article-writer__eyebrow">KNOWLEDGE LIBRARY</span>
              <h3 id="article-feed-title">Articles</h3>
            </div>
            <button
              type="button"
              onClick={() => loadArticles()}
              disabled={loading}
            >
              Refresh
            </button>
          </div>
          <label className="article-writer__label" htmlFor="article-search">
            Search articles
          </label>
          <input
            id="article-search"
            className="article-writer__title"
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search title, summary or content"
          />
          <div className="kb-filters"><div>
          <label className="article-writer__label" htmlFor="article-status">
            Status
          </label>
          <select
            id="article-status"
            className="article-writer__title"
            value={status}
            onChange={(event) => setStatus(event.target.value)}
          >
            <option value="">All articles</option>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
          </div><div>
          <CategorySelect
            id="article-category-filter"
            categories={categories}
            value={categoryFilter}
            onChange={setCategoryFilter}
            all
          />
          </div><div>
          <label className="article-writer__label" htmlFor="article-sort">
            Sort by
          </label>
          <select
            id="article-sort"
            className="article-writer__title"
            value={sort}
            onChange={(event) => setSort(event.target.value)}
          >
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="title">A–Z</option>
            <option value="updated">Recently updated</option>
          </select>
          </div></div>
          {nextPage && (
            <p className="article-writer__hint">
              Search, filters and sorting apply to loaded articles. Load more to
              include the next page.
            </p>
          )}
          {!loading &&
            !listError &&
            articles.length > 0 &&
            visibleArticles.length === 0 && (
              <p role="status">No loaded articles match your filters.</p>
            )}
          {listError && (
            <p className="article-writer__error" role="alert">
              {listError}
            </p>
          )}
          {loading && <p role="status">Loading articles…</p>}
          {!loading && !listError && articles.length === 0 && (
            <div className="article-feed__empty">
              <h4>No articles yet</h4>
              <p>
                Write your first article on the left. Saved articles will appear
                here.
              </p>
            </div>
          )}
          <div className="article-feed__list">
            {visibleArticles.map((article) => (
              <ArticleCard
                key={article.id}
                article={article}
                categories={categories}
                onSaved={(updated) => updateArticleList(article.id, updated)}
                onDeleted={() => updateArticleList(article.id, null)}
              />
            ))}
          </div>
          {nextPage && (
            <button
              className="article-feed__more"
              type="button"
              disabled={loading}
              onClick={() => loadArticles(nextPage)}
            >
              Load more articles
            </button>
          )}
        </section>
      </div>

      <KnowledgeCategories
        onSaved={(deletedId) => {
          if (deletedId != null) {
            if (String(category) === String(deletedId)) setCategory("");
            if (String(categoryFilter) === String(deletedId))
              setCategoryFilter("");
          }
          loadArticles();
        }}
        onLoaded={setCategories}
      />


    </div>
  );
}

export default KnowledgeBase;

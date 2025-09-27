/*
Novel Website Frontend
Single-file React component (default export) built with Tailwind CSS classes.
How to use:
1. Create a new project with Vite: `npm create vite@latest my-novel-site -- --template react`
2. Install -> `cd my-novel-site && npm install`
3. Add Tailwind following Tailwind + Vite instructions (or use your existing Tailwind setup).
4. Replace `src/App.jsx` content with this file's contents. Start with `npm run dev`.

Features included (front-end only):
- Responsive homepage showing novel cards
- Reader modal to read chapters with simple pagination
- Create / Edit novel UI stored in localStorage
- Simple mock Login / Signup modal (no backend) stored in localStorage for demo
- Search and filter by genre
- Clean, modern UI using Tailwind classes

Note: This is intended as a starting front-end. For auth, storage, and publishing you'll need a backend API.
*/

import React, { useEffect, useState } from "react";

const SAMPLE = [
  {
    id: "novel-1",
    title: "The Last Lantern",
    author: "A. Reyes",
    desc: "A quiet town hides an old secret — a lantern that remembers.",
    genres: ["Fantasy", "Mystery"],
    coverColor: "from-purple-400 to-indigo-600",
    chapters: [
      { id: 1, title: "Chapter 1", body: "The lantern sat on the shelf..." },
      { id: 2, title: "Chapter 2", body: "At dawn the lantern glowed..." },
    ],
  },
  {
    id: "novel-2",
    title: "Paper Boats",
    author: "B. Cruz",
    desc: "Childhood summers wrapped in paper boats and storms.",
    genres: ["Slice of Life"],
    coverColor: "from-yellow-300 to-orange-400",
    chapters: [
      { id: 1, title: "Chapter 1", body: "We folded the boat with sticky fingers..." },
    ],
  },
];

function uid(prefix = "id") {
  return prefix + "-" + Math.random().toString(36).slice(2, 9);
}

function useLocalStorage(key, initial) {
  const [state, setState] = useState(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : initial;
    } catch (e) {
      return initial;
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(state));
    } catch (e) {}
  }, [key, state]);
  return [state, setState];
}

export default function App() {
  const [novels, setNovels] = useLocalStorage("novels", SAMPLE);
  const [user, setUser] = useLocalStorage("user", null);

  const [query, setQuery] = useState("");
  const [genreFilter, setGenreFilter] = useState("All");

  const [showReader, setShowReader] = useState(false);
  const [activeNovel, setActiveNovel] = useState(null);
  const [activeChapterIndex, setActiveChapterIndex] = useState(0);

  const [showCreate, setShowCreate] = useState(false);
  const [editing, setEditing] = useState(null);

  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState("login");

  // Genres present
  const genres = Array.from(
    new Set(novels.flatMap((n) => n.genres))
  ).sort();

  function openReader(novel, chapterIndex = 0) {
    setActiveNovel(novel);
    setActiveChapterIndex(chapterIndex);
    setShowReader(true);
  }

  function saveNovel(payload) {
    if (payload.id) {
      setNovels((prev) => prev.map((p) => (p.id === payload.id ? payload : p)));
    } else {
      payload.id = uid("novel");
      setNovels((prev) => [payload, ...prev]);
    }
    setShowCreate(false);
    setEditing(null);
  }

  function removeNovel(id) {
    if (!confirm("Delete this novel?")) return;
    setNovels((prev) => prev.filter((n) => n.id !== id));
  }

  function signup(email, name) {
    const newUser = { id: uid("user"), email, name };
    setUser(newUser);
    setShowAuth(false);
  }

  function login(email) {
    // mock: any email will 'log in'
    const mock = { id: uid("user"), email, name: email.split("@")[0] };
    setUser(mock);
    setShowAuth(false);
  }

  function logout() {
    setUser(null);
  }

  const filtered = novels.filter((n) => {
    const matchesQuery = [n.title, n.author, n.desc].join(" ").toLowerCase().includes(query.toLowerCase());
    const matchesGenre = genreFilter === "All" || n.genres.includes(genreFilter);
    return matchesQuery && matchesGenre;
  });

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <header className="bg-white/60 backdrop-blur sticky top-0 z-30 border-b">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="text-2xl font-extrabold">JUNtech Novels</div>
            <div className="hidden sm:flex items-center gap-2 text-sm text-gray-600">
              <button onClick={() => { setShowCreate(true); setEditing(null); }} className="px-3 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100">New Novel</button>
              <div className="h-6 w-px bg-gray-200" />
              <select value={genreFilter} onChange={(e) => setGenreFilter(e.target.value)} className="rounded p-1 text-sm border">
                <option>All</option>
                {genres.map((g) => <option key={g}>{g}</option>)}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search novels, authors..." className="border rounded-full px-3 py-1 text-sm w-52" />
            </div>

            {user ? (
              <div className="flex items-center gap-2">
                <div className="text-sm">Hi, <span className="font-medium">{user.name}</span></div>
                <button onClick={logout} className="text-sm px-3 py-1 rounded-lg border">Log out</button>
              </div>
            ) : (
              <div>
                <button onClick={() => { setShowAuth(true); setAuthMode("login"); }} className="px-3 py-1 rounded-lg border">Log in / Sign up</button>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold">Featured & Recent</h2>
              <div className="text-sm text-gray-600">{filtered.length} results</div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filtered.map((n) => (
                <article key={n.id} className="rounded-2xl overflow-hidden shadow-sm bg-white border">
                  <div className={`p-4 flex gap-4 items-start`}> 
                    <div className={`w-28 h-36 rounded-lg bg-gradient-to-br ${n.coverColor} flex-shrink-0 flex items-end p-3 text-white`}>
                      <div className="text-sm font-bold leading-none">{n.title}</div>
                      <div className="text-xs">by {n.author}</div>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{n.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">{n.desc}</p>
                      <div className="mt-3 flex gap-2 items-center">
                        <button onClick={() => openReader(n, 0)} className="px-3 py-1 rounded bg-indigo-600 text-white text-sm">Read</button>
                        <button onClick={() => { setShowCreate(true); setEditing(n); }} className="px-3 py-1 rounded border text-sm">Edit</button>
                        <button onClick={() => removeNovel(n.id)} className="px-3 py-1 rounded border text-sm text-rose-600">Delete</button>
                        <div className="ml-auto text-xs text-gray-500">{n.genres.join(", ")}</div>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>

          <aside className="hidden md:block">
            <div className="sticky top-24 bg-white border rounded-xl p-4 shadow-sm">
              <h4 className="font-semibold">Trending Genres</h4>
              <div className="mt-3 flex flex-wrap gap-2">
                {genres.map((g) => (
                  <button key={g} onClick={() => setGenreFilter(g)} className="px-3 py-1 rounded-full border text-sm">{g}</button>
                ))}
              </div>

              <div className="mt-4 text-sm text-gray-600">Pro tip: Click "New Novel" to add your own — saves locally.</div>
            </div>
          </aside>
        </section>

        <section className="mt-10">
          <h3 className="text-lg font-semibold">All Novels</h3>
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {novels.map((n) => (
              <div key={n.id} className="border rounded-lg p-3 bg-white shadow-sm">
                <div className={`h-36 rounded-md bg-gradient-to-br ${n.coverColor} p-3 text-white flex flex-col justify-between`}> 
                  <div className="font-bold">{n.title}</div>
                  <div className="text-xs">{n.author}</div>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <div className="text-xs text-gray-600">{n.genres.join(", ")}</div>
                  <div className="flex gap-2">
                    <button onClick={() => openReader(n, 0)} className="text-xs px-2 py-1 rounded border">Read</button>
                    <button onClick={() => { setShowCreate(true); setEditing(n); }} className="text-xs px-2 py-1 rounded border">Edit</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Reader Modal */}
      {showReader && activeNovel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowReader(false)} />
          <div className="relative max-w-3xl w-full bg-white rounded-2xl shadow-2xl overflow-hidden">
            <div className="p-4 border-b flex items-center gap-3">
              <div className={`w-14 h-20 rounded-md bg-gradient-to-br ${activeNovel.coverColor} flex-shrink-0`} />
              <div>
                <div className="font-bold text-lg">{activeNovel.title}</div>
                <div className="text-sm text-gray-600">by {activeNovel.author}</div>
              </div>
              <div className="ml-auto flex items-center gap-2">
                <div className="text-sm text-gray-500">Chapter {activeNovel.chapters[activeChapterIndex]?.id}</div>
                <button onClick={() => setShowReader(false)} className="px-3 py-1 rounded border">Close</button>
              </div>
            </div>

            <div className="p-6 prose max-w-none">
              <h4>{activeNovel.chapters[activeChapterIndex]?.title}</h4>
              <p>{activeNovel.chapters[activeChapterIndex]?.body}</p>
            </div>

            <div className="p-4 border-t flex items-center gap-3">
              <button onClick={() => setActiveChapterIndex((i) => Math.max(0, i - 1))} className="px-3 py-1 rounded border">Prev</button>
              <button onClick={() => setActiveChapterIndex((i) => Math.min(activeNovel.chapters.length - 1, i + 1))} className="px-3 py-1 rounded border">Next</button>
              <div className="ml-auto text-sm text-gray-600">{activeChapterIndex + 1} / {activeNovel.chapters.length}</div>
            </div>
          </div>
        </div>
      )}

      {/* Create / Edit Modal */}
      {showCreate && (
        <CreateModal initial={editing} onClose={() => { setShowCreate(false); setEditing(null); }} onSave={saveNovel} />
      )}

      {/* Auth Modal */}
      {showAuth && (
        <AuthModal mode={authMode} setMode={setAuthMode} onClose={() => setShowAuth(false)} onLogin={login} onSignup={signup} />
      )}

      <footer className="mt-12 py-8 text-center text-sm text-gray-500">Built with ❤️ by JUNtech — Front-end demo</footer>
    </div>
  );
}

function CreateModal({ initial, onClose, onSave }) {
  const [title, setTitle] = useState(initial?.title || "");
  const [author, setAuthor] = useState(initial?.author || "");
  const [desc, setDesc] = useState(initial?.desc || "");
  const [genres, setGenres] = useState((initial?.genres || []).join(", "));
  const [coverColor, setCoverColor] = useState(initial?.coverColor || "from-purple-400 to-indigo-600");
  const [chapters, setChapters] = useState(initial?.chapters || [{ id: 1, title: "Chapter 1", body: "Start writing..." }]);

  function addChapter() {
    setChapters((c) => [...c, { id: c.length + 1, title: `Chapter ${c.length + 1}`, body: "" }]);
  }

  function save() {
    if (!title.trim()) return alert("Title required");
    const payload = {
      id: initial?.id,
      title,
      author: author || "Unknown",
      desc,
      genres: genres.split(",").map((s) => s.trim()).filter(Boolean),
      coverColor,
      chapters,
    };
    onSave(payload);
  }

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-semibold">{initial ? "Edit Novel" : "Create Novel"}</h4>
          <button onClick={onClose} className="px-3 py-1 rounded border">Close</button>
        </div>

        <div className="space-y-3">
          <input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full border rounded px-3 py-2" />
          <input placeholder="Author" value={author} onChange={(e) => setAuthor(e.target.value)} className="w-full border rounded px-3 py-2" />
          <input placeholder="Short description" value={desc} onChange={(e) => setDesc(e.target.value)} className="w-full border rounded px-3 py-2" />
          <input placeholder="Genres (comma separated)" value={genres} onChange={(e) => setGenres(e.target.value)} className="w-full border rounded px-3 py-2" />
          <select value={coverColor} onChange={(e) => setCoverColor(e.target.value)} className="w-full border rounded px-3 py-2">
            <option value="from-purple-400 to-indigo-600">Purple / Indigo</option>
            <option value="from-yellow-300 to-orange-400">Yellow / Orange</option>
            <option value="from-emerald-300 to-green-500">Green</option>
            <option value="from-sky-300 to-blue-500">Blue</option>
          </select>

          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-medium">Chapters</div>
              <button onClick={addChapter} className="px-2 py-1 rounded border text-sm">Add</button>
            </div>
            <div className="space-y-2 max-h-48 overflow-auto">
              {chapters.map((c, idx) => (
                <div key={idx} className="border rounded p-2">
                  <input value={c.title} onChange={(e) => setChapters((s) => s.map((x, i) => i === idx ? { ...x, title: e.target.value } : x))} className="w-full border rounded px-2 py-1 mb-1" />
                  <textarea value={c.body} onChange={(e) => setChapters((s) => s.map((x, i) => i === idx ? { ...x, body: e.target.value } : x))} className="w-full border rounded px-2 py-1 h-24" />
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2 justify-end">
            <button onClick={save} className="px-4 py-2 rounded bg-indigo-600 text-white">Save Novel</button>
            <button onClick={onClose} className="px-4 py-2 rounded border">Cancel</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function AuthModal({ mode, setMode, onClose, onLogin, onSignup }) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white rounded-xl shadow-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-semibold">{mode === "login" ? "Log in" : "Sign up"}</h4>
          <div className="text-xs text-gray-500">Demo only — localStorage</div>
        </div>

        <div className="space-y-3">
          {mode === "signup" && (
            <input placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)} className="w-full border rounded px-3 py-2" />
          )}
          <input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full border rounded px-3 py-2" />

          <div className="flex items-center gap-2 justify-end">
            <button onClick={() => { if (mode === "login") onLogin(email); else onSignup(email, name); }} className="px-4 py-2 rounded bg-indigo-600 text-white">{mode === "login" ? "Log in" : "Create account"}</button>
          </div>

          <div className="text-sm text-gray-600">
            {mode === "login" ? (
              <span>Need an account? <button onClick={() => setMode("signup")} className="underline">Sign up</button></span>
            ) : (
              <span>Already have one? <button onClick={() => setMode("login")} className="underline">Log in</button></span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

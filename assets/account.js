import { jsx, jsxs } from "react/jsx-runtime";
import { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
const PREFIX = "basicsplus.account.";
const SHOP_EMAIL = "shop@basicsplus.com";
const SERVICES = [
  "Rekey house locks",
  "Car key cut and program",
  "Lock repair or replacement",
  "Safe opening",
  "Commercial keying / master key",
  "Emergency lockout"
];
function uid() {
  return Math.random().toString(36).slice(2, 9);
}
function fmt(iso) {
  const d = /* @__PURE__ */ new Date(iso + (iso.length === 10 ? "T12:00:00" : ""));
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleDateString(void 0, { month: "short", day: "numeric", year: "numeric" });
}
function keyFor(email) {
  return PREFIX + email.trim().toLowerCase();
}
function readFile(email) {
  try {
    const raw = window.localStorage.getItem(keyFor(email));
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}
function sampleFile(email) {
  return {
    email,
    records: [
      {
        id: uid(),
        label: "Front door, side entry",
        kind: "Lock cylinder",
        detail: "Schlage C keyway, brass",
        place: "412 Miller Ave",
        notes: "Both doors keyed alike in March.",
        added: "2024-03-14"
      },
      {
        id: uid(),
        label: "2016 Honda CR-V",
        kind: "Fob / remote",
        detail: "HO01 blade, 4-button fob",
        place: "Vehicle",
        notes: "Spare cut and programmed at the shop counter.",
        added: "2024-08-02"
      },
      {
        id: uid(),
        label: "Shed padlock",
        kind: "Padlock",
        detail: "Abus 83/45, rekeyed to house key",
        place: "Back yard",
        notes: "",
        added: "2025-01-09"
      }
    ],
    requests: [
      {
        id: uid(),
        date: "2025-01-09",
        service: "Rekey house locks",
        address: "412 Miller Ave",
        status: "Completed",
        tech: "Dave"
      },
      {
        id: uid(),
        date: "2024-08-02",
        service: "Car key cut and program",
        address: "Shop counter, S State St",
        status: "Completed",
        tech: "Renee"
      }
    ],
    credits: [
      { id: uid(), name: "Rekey credit (3 cylinders)", remaining: 2, total: 3, expires: "2026-03-01" },
      { id: uid(), name: "Duplicate key credit", remaining: 5, total: 6, expires: "2026-06-30" }
    ],
    visits: [
      {
        id: uid(),
        date: "2025-11-18",
        time: "9:30 AM",
        service: "Lock repair or replacement",
        address: "412 Miller Ave",
        note: "Back door deadbolt sticks in cold weather."
      }
    ]
  };
}
function emptyFile(email) {
  return { email, records: [], requests: [], credits: [], visits: [] };
}
function App() {
  const [email, setEmail] = useState("");
  const [phase, setPhase] = useState("gate");
  const [gateError, setGateError] = useState("");
  const [storageError, setStorageError] = useState(false);
  const [file, setFile] = useState(null);
  const [tab, setTab] = useState("keys");
  const [flash, setFlash] = useState("");
  useEffect(() => {
    try {
      window.localStorage.setItem(PREFIX + "probe", "1");
      window.localStorage.removeItem(PREFIX + "probe");
    } catch {
      setStorageError(true);
    }
  }, []);
  useEffect(() => {
    if (phase !== "open" || !file) return;
    try {
      window.localStorage.setItem(keyFor(file.email), JSON.stringify(file));
    } catch {
      setStorageError(true);
    }
  }, [file, phase]);
  function openFile(e) {
    e.preventDefault();
    const value = email.trim();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/.test(value)) {
      setGateError("That email address does not look right. Check it and try again.");
      return;
    }
    setGateError("");
    setPhase("checking");
    window.setTimeout(() => {
      setFile(readFile(value) || emptyFile(value));
      setPhase("open");
      setTab("keys");
    }, 650);
  }
  const totalCredits = useMemo(
    () => file ? file.credits.reduce((n, c) => n + c.remaining, 0) : 0,
    [file]
  );
  if (phase !== "open" || !file) {
    return /* @__PURE__ */ jsxs("section", { className: "mx-auto max-w-2xl px-4 py-14", children: [
      /* @__PURE__ */ jsx("p", { className: "text-sm font-medium uppercase tracking-widest text-brand-600", children: "Basics Plus Locksmith" }),
      /* @__PURE__ */ jsx("h1", { className: "font-display mt-2 text-4xl text-ink", children: "My Account" }),
      /* @__PURE__ */ jsx("p", { className: "mt-4 text-ink/70", children: "Your key file holds the lock and key records we set up for you at the counter: keyways, what is keyed alike, the credits you have left and any visit we have on the calendar." }),
      /* @__PURE__ */ jsxs("div", { className: "card mt-8 p-6", children: [
        /* @__PURE__ */ jsxs("form", { onSubmit: openFile, className: "space-y-4", children: [
          /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-ink", htmlFor: "acct-email", children: "Email you gave us at the shop" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              id: "acct-email",
              type: "email",
              value: email,
              onChange: (ev) => setEmail(ev.target.value),
              placeholder: "you@example.com",
              className: "w-full rounded-lg border border-ink/15 bg-white px-4 py-3 text-ink outline-none focus:border-brand-600"
            }
          ),
          gateError ? /* @__PURE__ */ jsx("p", { className: "text-sm text-red-600", children: gateError }) : null,
          /* @__PURE__ */ jsx("button", { type: "submit", className: "btn w-full", disabled: phase === "checking", children: phase === "checking" ? "Opening your file..." : "Open my key file" }),
          phase === "checking" ? /* @__PURE__ */ jsx("p", { className: "text-center text-sm text-ink/60", children: "Reading the file on this device." }) : null
        ] }),
        /* @__PURE__ */ jsx("p", { className: "mt-5 border-t border-ink/10 pt-5 text-sm text-ink/60", children: "No password and no account. Your file is written to this browser only, so it stays on the device you are using. Nothing here is sent anywhere until you email us. Bitting codes stay in the shop safe on South State, never in a browser." })
      ] }),
      storageError ? /* @__PURE__ */ jsx("p", { className: "mt-4 rounded-lg bg-amber-50 p-4 text-sm text-amber-800", children: "This browser is blocking local storage, most likely private mode. You can still look around, but nothing you type will still be here tomorrow." }) : null,
      /* @__PURE__ */ jsxs("p", { className: "mt-6 text-sm text-ink/60", children: [
        "Lost the device that held your file? Email",
        " ",
        /* @__PURE__ */ jsx("a", { className: "text-brand-600 underline", href: "mailto:" + SHOP_EMAIL, children: SHOP_EMAIL }),
        " ",
        "and we will read your records back to you from the shop copy."
      ] })
    ] });
  }
  const f = file;
  const set = (next) => setFile({ ...f, ...next });
  return /* @__PURE__ */ jsxs("section", { className: "mx-auto max-w-5xl px-4 py-12", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-end justify-between gap-4", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("p", { className: "text-sm font-medium uppercase tracking-widest text-brand-600", children: "My Account" }),
        /* @__PURE__ */ jsx("h1", { className: "font-display mt-1 text-3xl text-ink", children: f.email }),
        /* @__PURE__ */ jsxs("p", { className: "mt-1 text-sm text-ink/60", children: [
          f.records.length,
          " saved records \xB7 ",
          totalCredits,
          " service credits left \xB7 ",
          f.visits.length,
          " visit",
          f.visits.length === 1 ? "" : "s",
          " on the calendar"
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
        /* @__PURE__ */ jsx(
          "button",
          {
            className: "btn-secondary",
            onClick: () => {
              setPhase("gate");
              setFile(null);
              setFlash("");
            },
            children: "Close file"
          }
        ),
        /* @__PURE__ */ jsx(
          "button",
          {
            className: "btn-secondary",
            onClick: () => {
              if (!window.confirm("Erase this file from this browser? The shop copy is not affected.")) return;
              try {
                window.localStorage.removeItem(keyFor(f.email));
              } catch {
                setStorageError(true);
              }
              setPhase("gate");
              setFile(null);
            },
            children: "Forget this device"
          }
        )
      ] })
    ] }),
    flash ? /* @__PURE__ */ jsx("p", { className: "mt-5 rounded-lg bg-brand-50 p-4 text-sm text-ink", children: flash }) : null,
    storageError ? /* @__PURE__ */ jsx("p", { className: "mt-5 rounded-lg bg-amber-50 p-4 text-sm text-amber-800", children: "This browser will not let us store your file, so changes disappear when you leave the page." }) : null,
    /* @__PURE__ */ jsx("nav", { className: "mt-8 flex flex-wrap gap-2", children: [
      ["keys", "Keys & locks"],
      ["history", "Service history"],
      ["credits", "Service credits"],
      ["visits", "Appointments"]
    ].map(([id, label]) => /* @__PURE__ */ jsx(
      "button",
      {
        onClick: () => setTab(id),
        className: tab === id ? "rounded-full bg-brand-600 px-4 py-2 text-sm font-medium text-white" : "rounded-full bg-white px-4 py-2 text-sm font-medium text-ink/70 ring-1 ring-ink/10 hover:text-ink",
        children: label
      },
      id
    )) }),
    /* @__PURE__ */ jsxs("div", { className: "mt-6", children: [
      tab === "keys" ? /* @__PURE__ */ jsx(
        KeysTab,
        {
          records: f.records,
          onAdd: (r) => set({ records: [r, ...f.records] }),
          onRemove: (id) => set({ records: f.records.filter((r) => r.id !== id) }),
          onSample: () => setFile(sampleFile(f.email)),
          canSample: f.records.length === 0 && f.requests.length === 0
        }
      ) : null,
      tab === "history" ? /* @__PURE__ */ jsx(
        HistoryTab,
        {
          requests: f.requests,
          onNew: (req, mail) => {
            set({ requests: [req, ...f.requests] });
            setFlash(
              "Added to your file and your email app should be opening now. We answer requests within one business day, usually the same morning."
            );
            window.location.href = mail;
          }
        }
      ) : null,
      tab === "credits" ? /* @__PURE__ */ jsx(CreditsTab, { credits: f.credits }) : null,
      tab === "visits" ? /* @__PURE__ */ jsx(
        VisitsTab,
        {
          visits: f.visits,
          onCancel: (id) => set({ visits: f.visits.filter((v) => v.id !== id) })
        }
      ) : null
    ] })
  ] });
}
function KeysTab(props) {
  const [label, setLabel] = useState("");
  const [kind, setKind] = useState("Lock cylinder");
  const [detail, setDetail] = useState("");
  const [place, setPlace] = useState("");
  const [notes, setNotes] = useState("");
  const [err, setErr] = useState("");
  function add(e) {
    e.preventDefault();
    if (!label.trim()) {
      setErr('Give the record a name, like "front door" or "shop back gate".');
      return;
    }
    setErr("");
    props.onAdd({
      id: uid(),
      label: label.trim(),
      kind,
      detail: detail.trim(),
      place: place.trim(),
      notes: notes.trim(),
      added: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10)
    });
    setLabel("");
    setDetail("");
    setPlace("");
    setNotes("");
  }
  return /* @__PURE__ */ jsxs("div", { className: "grid gap-6 md:grid-cols-5", children: [
    /* @__PURE__ */ jsx("div", { className: "md:col-span-3", children: props.records.length === 0 ? /* @__PURE__ */ jsxs("div", { className: "card p-6", children: [
      /* @__PURE__ */ jsx("h2", { className: "font-display text-xl text-ink", children: "Nothing saved yet" }),
      /* @__PURE__ */ jsx("p", { className: "mt-2 text-ink/70", children: "Add the locks and keys you want tracked. Most customers list the doors that are keyed alike, the car fob they carry and any padlock we rekeyed." }),
      props.canSample ? /* @__PURE__ */ jsx("button", { className: "btn-secondary mt-4", onClick: props.onSample, children: "Fill in a sample file to see the layout" }) : null
    ] }) : /* @__PURE__ */ jsx("ul", { className: "space-y-4", children: props.records.map((r) => /* @__PURE__ */ jsxs("li", { className: "card p-5", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between gap-4", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h3", { className: "font-display text-lg text-ink", children: r.label }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-brand-600", children: r.kind })
        ] }),
        /* @__PURE__ */ jsx(
          "button",
          {
            className: "text-sm text-ink/50 underline hover:text-ink",
            onClick: () => props.onRemove(r.id),
            children: "Remove"
          }
        )
      ] }),
      r.detail ? /* @__PURE__ */ jsx("p", { className: "mt-2 text-sm text-ink/80", children: r.detail }) : null,
      r.place ? /* @__PURE__ */ jsxs("p", { className: "mt-1 text-sm text-ink/60", children: [
        "Where: ",
        r.place
      ] }) : null,
      r.notes ? /* @__PURE__ */ jsx("p", { className: "mt-2 text-sm text-ink/70", children: r.notes }) : null,
      /* @__PURE__ */ jsxs("p", { className: "mt-3 text-xs uppercase tracking-wide text-ink/40", children: [
        "Saved ",
        fmt(r.added)
      ] })
    ] }, r.id)) }) }),
    /* @__PURE__ */ jsxs("form", { onSubmit: add, className: "card space-y-3 p-5 md:col-span-2", children: [
      /* @__PURE__ */ jsx("h2", { className: "font-display text-lg text-ink", children: "Add a lock or key" }),
      /* @__PURE__ */ jsx(
        "input",
        {
          value: label,
          onChange: (e) => setLabel(e.target.value),
          placeholder: "Front door",
          className: "w-full rounded-lg border border-ink/15 px-3 py-2 text-ink outline-none focus:border-brand-600"
        }
      ),
      /* @__PURE__ */ jsxs(
        "select",
        {
          value: kind,
          onChange: (e) => setKind(e.target.value),
          className: "w-full rounded-lg border border-ink/15 bg-white px-3 py-2 text-ink outline-none focus:border-brand-600",
          children: [
            /* @__PURE__ */ jsx("option", { children: "Lock cylinder" }),
            /* @__PURE__ */ jsx("option", { children: "House key" }),
            /* @__PURE__ */ jsx("option", { children: "Fob / remote" }),
            /* @__PURE__ */ jsx("option", { children: "Padlock" }),
            /* @__PURE__ */ jsx("option", { children: "Safe" }),
            /* @__PURE__ */ jsx("option", { children: "Commercial keyway" })
          ]
        }
      ),
      /* @__PURE__ */ jsx(
        "input",
        {
          value: detail,
          onChange: (e) => setDetail(e.target.value),
          placeholder: "Keyway, brand or blank (Schlage C, KW1...)",
          className: "w-full rounded-lg border border-ink/15 px-3 py-2 text-ink outline-none focus:border-brand-600"
        }
      ),
      /* @__PURE__ */ jsx(
        "input",
        {
          value: place,
          onChange: (e) => setPlace(e.target.value),
          placeholder: "Address or vehicle",
          className: "w-full rounded-lg border border-ink/15 px-3 py-2 text-ink outline-none focus:border-brand-600"
        }
      ),
      /* @__PURE__ */ jsx(
        "textarea",
        {
          value: notes,
          onChange: (e) => setNotes(e.target.value),
          rows: 3,
          placeholder: "Notes for the counter",
          className: "w-full rounded-lg border border-ink/15 px-3 py-2 text-ink outline-none focus:border-brand-600"
        }
      ),
      err ? /* @__PURE__ */ jsx("p", { className: "text-sm text-red-600", children: err }) : null,
      /* @__PURE__ */ jsx("button", { type: "submit", className: "btn w-full", children: "Save to my file" }),
      /* @__PURE__ */ jsx("p", { className: "text-xs text-ink/50", children: "Please leave out key codes and bitting. We keep those in the shop, matched to your name and ID." })
    ] })
  ] });
}
function HistoryTab(props) {
  const [service, setService] = useState(SERVICES[0]);
  const [date, setDate] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [err, setErr] = useState("");
  function submit(e) {
    e.preventDefault();
    if (!address.trim()) {
      setErr("We need the address or the vehicle location before we roll a truck.");
      return;
    }
    setErr("");
    const body = "Service: " + service + "\nPreferred date: " + (date || "first opening") + "\nLocation: " + address + "\nNotes: " + (notes || "none");
    const mail = "mailto:" + SHOP_EMAIL + "?subject=" + encodeURIComponent("Service request: " + service) + "&body=" + encodeURIComponent(body);
    props.onNew(
      {
        id: uid(),
        date: date || (/* @__PURE__ */ new Date()).toISOString().slice(0, 10),
        service,
        address: address.trim(),
        status: "Requested",
        tech: "Unassigned"
      },
      mail
    );
    setAddress("");
    setNotes("");
    setDate("");
  }
  return /* @__PURE__ */ jsxs("div", { className: "grid gap-6 md:grid-cols-5", children: [
    /* @__PURE__ */ jsxs("div", { className: "md:col-span-3", children: [
      /* @__PURE__ */ jsx("h2", { className: "font-display text-xl text-ink", children: "Past work" }),
      props.requests.length === 0 ? /* @__PURE__ */ jsx("p", { className: "card mt-3 p-6 text-ink/70", children: "No jobs on file for this address yet. Once we finish a call, add it here so you have the date and the tech handy." }) : /* @__PURE__ */ jsx("ul", { className: "mt-3 space-y-3", children: props.requests.map((r) => /* @__PURE__ */ jsxs("li", { className: "card flex flex-wrap items-center justify-between gap-3 p-5", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h3", { className: "font-display text-lg text-ink", children: r.service }),
          /* @__PURE__ */ jsxs("p", { className: "text-sm text-ink/60", children: [
            fmt(r.date),
            " \xB7 ",
            r.address,
            " \xB7 Tech: ",
            r.tech
          ] })
        ] }),
        /* @__PURE__ */ jsx(
          "span",
          {
            className: r.status === "Completed" ? "rounded-full bg-brand-50 px-3 py-1 text-sm text-brand-600" : "rounded-full bg-amber-50 px-3 py-1 text-sm text-amber-700",
            children: r.status
          }
        )
      ] }, r.id)) })
    ] }),
    /* @__PURE__ */ jsxs("form", { onSubmit: submit, className: "card space-y-3 p-5 md:col-span-2", children: [
      /* @__PURE__ */ jsx("h2", { className: "font-display text-lg text-ink", children: "Request a visit" }),
      /* @__PURE__ */ jsx(
        "select",
        {
          value: service,
          onChange: (e) => setService(e.target.value),
          className: "w-full rounded-lg border border-ink/15 bg-white px-3 py-2 text-ink outline-none focus:border-brand-600",
          children: SERVICES.map((s) => /* @__PURE__ */ jsx("option", { children: s }, s))
        }
      ),
      /* @__PURE__ */ jsx(
        "input",
        {
          type: "date",
          value: date,
          onChange: (e) => setDate(e.target.value),
          className: "w-full rounded-lg border border-ink/15 px-3 py-2 text-ink outline-none focus:border-brand-600"
        }
      ),
      /* @__PURE__ */ jsx(
        "input",
        {
          value: address,
          onChange: (e) => setAddress(e.target.value),
          placeholder: "Address or where the car is parked",
          className: "w-full rounded-lg border border-ink/15 px-3 py-2 text-ink outline-none focus:border-brand-600"
        }
      ),
      /* @__PURE__ */ jsx(
        "textarea",
        {
          value: notes,
          onChange: (e) => setNotes(e.target.value),
          rows: 3,
          placeholder: "What is going on with the lock?",
          className: "w-full rounded-lg border border-ink/15 px-3 py-2 text-ink outline-none focus:border-brand-600"
        }
      ),
      err ? /* @__PURE__ */ jsx("p", { className: "text-sm text-red-600", children: err }) : null,
      /* @__PURE__ */ jsx("button", { type: "submit", className: "btn w-full", children: "Send request to the shop" }),
      /* @__PURE__ */ jsxs("p", { className: "text-xs text-ink/50", children: [
        "This opens an email to ",
        SHOP_EMAIL,
        " and keeps a copy in your file on this device. Locked out right now? Call the shop at (734) 555-0142 instead."
      ] })
    ] })
  ] });
}
function CreditsTab(props) {
  if (props.credits.length === 0) {
    return /* @__PURE__ */ jsxs("div", { className: "card p-6", children: [
      /* @__PURE__ */ jsx("h2", { className: "font-display text-xl text-ink", children: "No credits on this file" }),
      /* @__PURE__ */ jsx("p", { className: "mt-2 text-ink/70", children: "Credits are prepaid blocks: rekeys, duplicate keys, or a set of service calls for a rental property. Buy them at the counter or over the phone and we will note them on your file." }),
      /* @__PURE__ */ jsx("a", { className: "btn mt-4 inline-block", href: "mailto:" + SHOP_EMAIL + "?subject=" + encodeURIComponent("Buying service credits"), children: "Ask about credit blocks" })
    ] });
  }
  return /* @__PURE__ */ jsx("div", { className: "grid gap-4 sm:grid-cols-2", children: props.credits.map((c) => /* @__PURE__ */ jsxs("div", { className: "card p-5", children: [
    /* @__PURE__ */ jsx("h3", { className: "font-display text-lg text-ink", children: c.name }),
    /* @__PURE__ */ jsx("p", { className: "mt-2 text-3xl text-brand-600", children: c.remaining }),
    /* @__PURE__ */ jsxs("p", { className: "text-sm text-ink/60", children: [
      "of ",
      c.total,
      " left \xB7 good through ",
      fmt(c.expires)
    ] }),
    /* @__PURE__ */ jsx("div", { className: "mt-3 h-2 w-full rounded-full bg-ink/10", children: /* @__PURE__ */ jsx(
      "div",
      {
        className: c.remaining / c.total > 0.34 ? "h-2 rounded-full bg-brand-600 w-2/3" : "h-2 rounded-full bg-amber-500 w-1/4"
      }
    ) }),
    /* @__PURE__ */ jsx("p", { className: "mt-3 text-sm text-ink/70", children: "Mention this credit when you call and the tech will draw from it instead of writing a new invoice." })
  ] }, c.id)) });
}
function VisitsTab(props) {
  if (props.visits.length === 0) {
    return /* @__PURE__ */ jsxs("div", { className: "card p-6", children: [
      /* @__PURE__ */ jsx("h2", { className: "font-display text-xl text-ink", children: "Nothing scheduled" }),
      /* @__PURE__ */ jsx("p", { className: "mt-2 text-ink/70", children: "When we book a time, it shows up here with the tech name and the window. Use the service history tab to ask for a visit, or call the shop and we will pencil you in." })
    ] });
  }
  return /* @__PURE__ */ jsx("ul", { className: "space-y-4", children: props.visits.map((v) => /* @__PURE__ */ jsx("li", { className: "card p-5", children: /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-start justify-between gap-3", children: [
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("h3", { className: "font-display text-lg text-ink", children: v.service }),
      /* @__PURE__ */ jsxs("p", { className: "text-sm text-brand-600", children: [
        fmt(v.date),
        " at ",
        v.time
      ] }),
      /* @__PURE__ */ jsx("p", { className: "text-sm text-ink/60", children: v.address }),
      v.note ? /* @__PURE__ */ jsx("p", { className: "mt-2 text-sm text-ink/70", children: v.note }) : null
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
      /* @__PURE__ */ jsx(
        "a",
        {
          className: "btn-secondary",
          href: "mailto:" + SHOP_EMAIL + "?subject=" + encodeURIComponent("Reschedule " + v.service + " on " + v.date),
          children: "Reschedule"
        }
      ),
      /* @__PURE__ */ jsx("button", { className: "btn-secondary", onClick: () => props.onCancel(v.id), children: "Cancel" })
    ] })
  ] }) }, v.id)) });
}
createRoot(document.getElementById("tibly-app-root")).render(/* @__PURE__ */ jsx(App, {}));

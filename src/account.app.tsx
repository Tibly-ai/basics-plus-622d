import { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";

type Tab = "keys" | "history" | "credits" | "visits";

type KeyRecord = {
  id: string;
  label: string;
  kind: string;
  detail: string;
  place: string;
  notes: string;
  added: string;
};

type ServiceRequest = {
  id: string;
  date: string;
  service: string;
  address: string;
  status: string;
  tech: string;
};

type Credit = { id: string; name: string; remaining: number; total: number; expires: string };

type Visit = { id: string; date: string; time: string; service: string; address: string; note: string };

type AccountFile = {
  email: string;
  records: KeyRecord[];
  requests: ServiceRequest[];
  credits: Credit[];
  visits: Visit[];
};

const PREFIX = "basicsplus.account.";
const SHOP_EMAIL = "shop@basicsplus.com";
const SERVICES = [
  "Rekey house locks",
  "Car key cut and program",
  "Lock repair or replacement",
  "Safe opening",
  "Commercial keying / master key",
  "Emergency lockout",
];

function uid() {
  return Math.random().toString(36).slice(2, 9);
}

function fmt(iso: string) {
  const d = new Date(iso + (iso.length === 10 ? "T12:00:00" : ""));
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

function keyFor(email: string) {
  return PREFIX + email.trim().toLowerCase();
}

function readFile(email: string): AccountFile | null {
  try {
    const raw = window.localStorage.getItem(keyFor(email));
    if (!raw) return null;
    return JSON.parse(raw) as AccountFile;
  } catch {
    return null;
  }
}

function sampleFile(email: string): AccountFile {
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
        added: "2024-03-14",
      },
      {
        id: uid(),
        label: "2016 Honda CR-V",
        kind: "Fob / remote",
        detail: "HO01 blade, 4-button fob",
        place: "Vehicle",
        notes: "Spare cut and programmed at the shop counter.",
        added: "2024-08-02",
      },
      {
        id: uid(),
        label: "Shed padlock",
        kind: "Padlock",
        detail: "Abus 83/45, rekeyed to house key",
        place: "Back yard",
        notes: "",
        added: "2025-01-09",
      },
    ],
    requests: [
      {
        id: uid(),
        date: "2025-01-09",
        service: "Rekey house locks",
        address: "412 Miller Ave",
        status: "Completed",
        tech: "Dave",
      },
      {
        id: uid(),
        date: "2024-08-02",
        service: "Car key cut and program",
        address: "Shop counter, S State St",
        status: "Completed",
        tech: "Renee",
      },
    ],
    credits: [
      { id: uid(), name: "Rekey credit (3 cylinders)", remaining: 2, total: 3, expires: "2026-03-01" },
      { id: uid(), name: "Duplicate key credit", remaining: 5, total: 6, expires: "2026-06-30" },
    ],
    visits: [
      {
        id: uid(),
        date: "2025-11-18",
        time: "9:30 AM",
        service: "Lock repair or replacement",
        address: "412 Miller Ave",
        note: "Back door deadbolt sticks in cold weather.",
      },
    ],
  };
}

function emptyFile(email: string): AccountFile {
  return { email, records: [], requests: [], credits: [], visits: [] };
}

function App() {
  const [email, setEmail] = useState("");
  const [phase, setPhase] = useState<"gate" | "checking" | "open">("gate");
  const [gateError, setGateError] = useState("");
  const [storageError, setStorageError] = useState(false);
  const [file, setFile] = useState<AccountFile | null>(null);
  const [tab, setTab] = useState<Tab>("keys");
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

  function openFile(e: React.FormEvent) {
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
    () => (file ? file.credits.reduce((n, c) => n + c.remaining, 0) : 0),
    [file]
  );

  if (phase !== "open" || !file) {
    return (
      <section className="mx-auto max-w-2xl px-4 py-14">
        <p className="text-sm font-medium uppercase tracking-widest text-brand-600">Basics Plus Locksmith</p>
        <h1 className="font-display mt-2 text-4xl text-ink">My Account</h1>
        <p className="mt-4 text-ink/70">
          Your key file holds the lock and key records we set up for you at the counter: keyways, what is keyed
          alike, the credits you have left and any visit we have on the calendar.
        </p>
        <div className="card mt-8 p-6">
          <form onSubmit={openFile} className="space-y-4">
            <label className="block text-sm font-medium text-ink" htmlFor="acct-email">
              Email you gave us at the shop
            </label>
            <input
              id="acct-email"
              type="email"
              value={email}
              onChange={(ev) => setEmail(ev.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-lg border border-ink/15 bg-white px-4 py-3 text-ink outline-none focus:border-brand-600"
            />
            {gateError ? <p className="text-sm text-red-600">{gateError}</p> : null}
            <button type="submit" className="btn w-full" disabled={phase === "checking"}>
              {phase === "checking" ? "Opening your file..." : "Open my key file"}
            </button>
            {phase === "checking" ? (
              <p className="text-center text-sm text-ink/60">Reading the file on this device.</p>
            ) : null}
          </form>
          <p className="mt-5 border-t border-ink/10 pt-5 text-sm text-ink/60">
            No password and no account. Your file is written to this browser only, so it stays on the device you
            are using. Nothing here is sent anywhere until you email us. Bitting codes stay in the shop safe on
            South State, never in a browser.
          </p>
        </div>
        {storageError ? (
          <p className="mt-4 rounded-lg bg-amber-50 p-4 text-sm text-amber-800">
            This browser is blocking local storage, most likely private mode. You can still look around, but
            nothing you type will still be here tomorrow.
          </p>
        ) : null}
        <p className="mt-6 text-sm text-ink/60">
          Lost the device that held your file? Email{" "}
          <a className="text-brand-600 underline" href={"mailto:" + SHOP_EMAIL}>
            {SHOP_EMAIL}
          </a>{" "}
          and we will read your records back to you from the shop copy.
        </p>
      </section>
    );
  }

  const f = file;
  const set = (next: Partial<AccountFile>) => setFile({ ...f, ...next });

  return (
    <section className="mx-auto max-w-5xl px-4 py-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-medium uppercase tracking-widest text-brand-600">My Account</p>
          <h1 className="font-display mt-1 text-3xl text-ink">{f.email}</h1>
          <p className="mt-1 text-sm text-ink/60">
            {f.records.length} saved records · {totalCredits} service credits left · {f.visits.length} visit
            {f.visits.length === 1 ? "" : "s"} on the calendar
          </p>
        </div>
        <div className="flex gap-2">
          <button
            className="btn-secondary"
            onClick={() => {
              setPhase("gate");
              setFile(null);
              setFlash("");
            }}
          >
            Close file
          </button>
          <button
            className="btn-secondary"
            onClick={() => {
              if (!window.confirm("Erase this file from this browser? The shop copy is not affected.")) return;
              try {
                window.localStorage.removeItem(keyFor(f.email));
              } catch {
                setStorageError(true);
              }
              setPhase("gate");
              setFile(null);
            }}
          >
            Forget this device
          </button>
        </div>
      </div>

      {flash ? (
        <p className="mt-5 rounded-lg bg-brand-50 p-4 text-sm text-ink">{flash}</p>
      ) : null}
      {storageError ? (
        <p className="mt-5 rounded-lg bg-amber-50 p-4 text-sm text-amber-800">
          This browser will not let us store your file, so changes disappear when you leave the page.
        </p>
      ) : null}

      <nav className="mt-8 flex flex-wrap gap-2">
        {([
          ["keys", "Keys & locks"],
          ["history", "Service history"],
          ["credits", "Service credits"],
          ["visits", "Appointments"],
        ] as [Tab, string][]).map(([id, label]) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={
              tab === id
                ? "rounded-full bg-brand-600 px-4 py-2 text-sm font-medium text-white"
                : "rounded-full bg-white px-4 py-2 text-sm font-medium text-ink/70 ring-1 ring-ink/10 hover:text-ink"
            }
          >
            {label}
          </button>
        ))}
      </nav>

      <div className="mt-6">
        {tab === "keys" ? (
          <KeysTab
            records={f.records}
            onAdd={(r) => set({ records: [r, ...f.records] })}
            onRemove={(id) => set({ records: f.records.filter((r) => r.id !== id) })}
            onSample={() => setFile(sampleFile(f.email))}
            canSample={f.records.length === 0 && f.requests.length === 0}
          />
        ) : null}

        {tab === "history" ? (
          <HistoryTab
            requests={f.requests}
            onNew={(req, mail) => {
              set({ requests: [req, ...f.requests] });
              setFlash(
                "Added to your file and your email app should be opening now. We answer requests within one business day, usually the same morning."
              );
              window.location.href = mail;
            }}
          />
        ) : null}

        {tab === "credits" ? <CreditsTab credits={f.credits} /> : null}

        {tab === "visits" ? (
          <VisitsTab
            visits={f.visits}
            onCancel={(id) => set({ visits: f.visits.filter((v) => v.id !== id) })}
          />
        ) : null}
      </div>
    </section>
  );
}

function KeysTab(props: {
  records: KeyRecord[];
  onAdd: (r: KeyRecord) => void;
  onRemove: (id: string) => void;
  onSample: () => void;
  canSample: boolean;
}) {
  const [label, setLabel] = useState("");
  const [kind, setKind] = useState("Lock cylinder");
  const [detail, setDetail] = useState("");
  const [place, setPlace] = useState("");
  const [notes, setNotes] = useState("");
  const [err, setErr] = useState("");

  function add(e: React.FormEvent) {
    e.preventDefault();
    if (!label.trim()) {
      setErr("Give the record a name, like \"front door\" or \"shop back gate\".");
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
      added: new Date().toISOString().slice(0, 10),
    });
    setLabel("");
    setDetail("");
    setPlace("");
    setNotes("");
  }

  return (
    <div className="grid gap-6 md:grid-cols-5">
      <div className="md:col-span-3">
        {props.records.length === 0 ? (
          <div className="card p-6">
            <h2 className="font-display text-xl text-ink">Nothing saved yet</h2>
            <p className="mt-2 text-ink/70">
              Add the locks and keys you want tracked. Most customers list the doors that are keyed alike, the
              car fob they carry and any padlock we rekeyed.
            </p>
            {props.canSample ? (
              <button className="btn-secondary mt-4" onClick={props.onSample}>
                Fill in a sample file to see the layout
              </button>
            ) : null}
          </div>
        ) : (
          <ul className="space-y-4">
            {props.records.map((r) => (
              <li key={r.id} className="card p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-display text-lg text-ink">{r.label}</h3>
                    <p className="text-sm text-brand-600">{r.kind}</p>
                  </div>
                  <button
                    className="text-sm text-ink/50 underline hover:text-ink"
                    onClick={() => props.onRemove(r.id)}
                  >
                    Remove
                  </button>
                </div>
                {r.detail ? <p className="mt-2 text-sm text-ink/80">{r.detail}</p> : null}
                {r.place ? <p className="mt-1 text-sm text-ink/60">Where: {r.place}</p> : null}
                {r.notes ? <p className="mt-2 text-sm text-ink/70">{r.notes}</p> : null}
                <p className="mt-3 text-xs uppercase tracking-wide text-ink/40">Saved {fmt(r.added)}</p>
              </li>
            ))}
          </ul>
        )}
      </div>

      <form onSubmit={add} className="card space-y-3 p-5 md:col-span-2">
        <h2 className="font-display text-lg text-ink">Add a lock or key</h2>
        <input
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="Front door"
          className="w-full rounded-lg border border-ink/15 px-3 py-2 text-ink outline-none focus:border-brand-600"
        />
        <select
          value={kind}
          onChange={(e) => setKind(e.target.value)}
          className="w-full rounded-lg border border-ink/15 bg-white px-3 py-2 text-ink outline-none focus:border-brand-600"
        >
          <option>Lock cylinder</option>
          <option>House key</option>
          <option>Fob / remote</option>
          <option>Padlock</option>
          <option>Safe</option>
          <option>Commercial keyway</option>
        </select>
        <input
          value={detail}
          onChange={(e) => setDetail(e.target.value)}
          placeholder="Keyway, brand or blank (Schlage C, KW1...)"
          className="w-full rounded-lg border border-ink/15 px-3 py-2 text-ink outline-none focus:border-brand-600"
        />
        <input
          value={place}
          onChange={(e) => setPlace(e.target.value)}
          placeholder="Address or vehicle"
          className="w-full rounded-lg border border-ink/15 px-3 py-2 text-ink outline-none focus:border-brand-600"
        />
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          placeholder="Notes for the counter"
          className="w-full rounded-lg border border-ink/15 px-3 py-2 text-ink outline-none focus:border-brand-600"
        />
        {err ? <p className="text-sm text-red-600">{err}</p> : null}
        <button type="submit" className="btn w-full">Save to my file</button>
        <p className="text-xs text-ink/50">
          Please leave out key codes and bitting. We keep those in the shop, matched to your name and ID.
        </p>
      </form>
    </div>
  );
}

function HistoryTab(props: { requests: ServiceRequest[]; onNew: (r: ServiceRequest, mail: string) => void }) {
  const [service, setService] = useState(SERVICES[0]);
  const [date, setDate] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [err, setErr] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!address.trim()) {
      setErr("We need the address or the vehicle location before we roll a truck.");
      return;
    }
    setErr("");
    const body =
      "Service: " + service + "\nPreferred date: " + (date || "first opening") + "\nLocation: " + address +
      "\nNotes: " + (notes || "none");
    const mail =
      "mailto:" + SHOP_EMAIL + "?subject=" + encodeURIComponent("Service request: " + service) +
      "&body=" + encodeURIComponent(body);
    props.onNew(
      {
        id: uid(),
        date: date || new Date().toISOString().slice(0, 10),
        service,
        address: address.trim(),
        status: "Requested",
        tech: "Unassigned",
      },
      mail
    );
    setAddress("");
    setNotes("");
    setDate("");
  }

  return (
    <div className="grid gap-6 md:grid-cols-5">
      <div className="md:col-span-3">
        <h2 className="font-display text-xl text-ink">Past work</h2>
        {props.requests.length === 0 ? (
          <p className="card mt-3 p-6 text-ink/70">
            No jobs on file for this address yet. Once we finish a call, add it here so you have the date and
            the tech handy.
          </p>
        ) : (
          <ul className="mt-3 space-y-3">
            {props.requests.map((r) => (
              <li key={r.id} className="card flex flex-wrap items-center justify-between gap-3 p-5">
                <div>
                  <h3 className="font-display text-lg text-ink">{r.service}</h3>
                  <p className="text-sm text-ink/60">
                    {fmt(r.date)} · {r.address} · Tech: {r.tech}
                  </p>
                </div>
                <span
                  className={
                    r.status === "Completed"
                      ? "rounded-full bg-brand-50 px-3 py-1 text-sm text-brand-600"
                      : "rounded-full bg-amber-50 px-3 py-1 text-sm text-amber-700"
                  }
                >
                  {r.status}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <form onSubmit={submit} className="card space-y-3 p-5 md:col-span-2">
        <h2 className="font-display text-lg text-ink">Request a visit</h2>
        <select
          value={service}
          onChange={(e) => setService(e.target.value)}
          className="w-full rounded-lg border border-ink/15 bg-white px-3 py-2 text-ink outline-none focus:border-brand-600"
        >
          {SERVICES.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-full rounded-lg border border-ink/15 px-3 py-2 text-ink outline-none focus:border-brand-600"
        />
        <input
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="Address or where the car is parked"
          className="w-full rounded-lg border border-ink/15 px-3 py-2 text-ink outline-none focus:border-brand-600"
        />
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          placeholder="What is going on with the lock?"
          className="w-full rounded-lg border border-ink/15 px-3 py-2 text-ink outline-none focus:border-brand-600"
        />
        {err ? <p className="text-sm text-red-600">{err}</p> : null}
        <button type="submit" className="btn w-full">Send request to the shop</button>
        <p className="text-xs text-ink/50">
          This opens an email to {SHOP_EMAIL} and keeps a copy in your file on this device. Locked out right
          now? Call the shop at (734) 555-0142 instead.
        </p>
      </form>
    </div>
  );
}

function CreditsTab(props: { credits: Credit[] }) {
  if (props.credits.length === 0) {
    return (
      <div className="card p-6">
        <h2 className="font-display text-xl text-ink">No credits on this file</h2>
        <p className="mt-2 text-ink/70">
          Credits are prepaid blocks: rekeys, duplicate keys, or a set of service calls for a rental property.
          Buy them at the counter or over the phone and we will note them on your file.
        </p>
        <a className="btn mt-4 inline-block" href={"mailto:" + SHOP_EMAIL + "?subject=" + encodeURIComponent("Buying service credits")}>
          Ask about credit blocks
        </a>
      </div>
    );
  }
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {props.credits.map((c) => (
        <div key={c.id} className="card p-5">
          <h3 className="font-display text-lg text-ink">{c.name}</h3>
          <p className="mt-2 text-3xl text-brand-600">{c.remaining}</p>
          <p className="text-sm text-ink/60">
            of {c.total} left · good through {fmt(c.expires)}
          </p>
          <div className="mt-3 h-2 w-full rounded-full bg-ink/10">
            <div
              className={
                c.remaining / c.total > 0.34
                  ? "h-2 rounded-full bg-brand-600 w-2/3"
                  : "h-2 rounded-full bg-amber-500 w-1/4"
              }
            />
          </div>
          <p className="mt-3 text-sm text-ink/70">
            Mention this credit when you call and the tech will draw from it instead of writing a new invoice.
          </p>
        </div>
      ))}
    </div>
  );
}

function VisitsTab(props: { visits: Visit[]; onCancel: (id: string) => void }) {
  if (props.visits.length === 0) {
    return (
      <div className="card p-6">
        <h2 className="font-display text-xl text-ink">Nothing scheduled</h2>
        <p className="mt-2 text-ink/70">
          When we book a time, it shows up here with the tech name and the window. Use the service history tab
          to ask for a visit, or call the shop and we will pencil you in.
        </p>
      </div>
    );
  }
  return (
    <ul className="space-y-4">
      {props.visits.map((v) => (
        <li key={v.id} className="card p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h3 className="font-display text-lg text-ink">{v.service}</h3>
              <p className="text-sm text-brand-600">
                {fmt(v.date)} at {v.time}
              </p>
              <p className="text-sm text-ink/60">{v.address}</p>
              {v.note ? <p className="mt-2 text-sm text-ink/70">{v.note}</p> : null}
            </div>
            <div className="flex gap-2">
              <a
                className="btn-secondary"
                href={"mailto:" + SHOP_EMAIL + "?subject=" + encodeURIComponent("Reschedule " + v.service + " on " + v.date)}
              >
                Reschedule
              </a>
              <button className="btn-secondary" onClick={() => props.onCancel(v.id)}>
                Cancel
              </button>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}

createRoot(document.getElementById("tibly-app-root")!).render(<App />);
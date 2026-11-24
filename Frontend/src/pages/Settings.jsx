import React, { useEffect, useRef, useState } from "react";
import { Upload, Trash2, ShieldCheck, LockKeyhole } from "lucide-react";
import "./Settings.css";

const initialProfile = {
  name: "Jordan Davis",
  email: "jordan.davis@example.com",
  phone: "+1 202 555 0148",
  linkedin: "",
  website: "",
  language: "English",
  currency: "USD",
};
const sections = [
  { key: "name", title: "Name", fields: [["name", "Name", "text"]] },
  {
    key: "contacts",
    title: "Contacts",
    fields: [
      ["phone", "Phone", "tel"],
      ["email", "Email", "email"],
    ],
  },
  {
    key: "social",
    title: "Social media",
    fields: [
      ["linkedin", "LinkedIn URL", "url"],
      ["website", "Website URL", "url"],
    ],
  },
  {
    key: "preferences",
    title: "Language & currency",
    fields: [
      ["language", "Language", ["English", "Hindi", "Tamil"]],
      ["currency", "Currency", ["USD", "INR", "EUR", "GBP"]],
    ],
  },
];

export default function Settings({ registerPageGuard }) {
  const [profile, setProfile] = useState(initialProfile);
  const [draft, setDraft] = useState(initialProfile);
  const [editing, setEditing] = useState("");
  const [message, setMessage] = useState("");
  const [photo, setPhoto] = useState("");
  const [theme, setTheme] = useState("light");
  const upload = useRef(null);
  const dirty = JSON.stringify(draft) !== JSON.stringify(profile);
  useEffect(() => {
    registerPageGuard?.(
      () => !dirty || window.confirm("Discard unsaved sample profile changes?"),
    );
    return () => registerPageGuard?.(null);
  }, [dirty, registerPageGuard]);
  useEffect(
    () => () => {
      if (photo) URL.revokeObjectURL(photo);
    },
    [photo],
  );

  function edit(key) {
    if (dirty && !window.confirm("Discard unsaved sample profile changes?"))
      return;
    setDraft(profile);
    setEditing(key);
    setMessage("");
  }
  function save(event) {
    event.preventDefault();
    if (!draft.name.trim()) {
      setMessage("Enter a name.");
      return;
    }
    const next = Object.fromEntries(
      Object.entries(draft).map(([key, value]) => [key, value.trim()]),
    );
    setProfile(next);
    setDraft(next);
    setEditing("");
    setMessage(
      "Sample profile saved for this view only. No account was updated.",
    );
  }
  function choosePhoto(event) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (
      !["image/jpeg", "image/png", "image/webp"].includes(file.type) ||
      file.size > 5 * 1024 * 1024
    ) {
      setMessage("Choose a JPG, PNG, or WebP image up to 5 MB.");
      return;
    }
    setPhoto(URL.createObjectURL(file));
    setMessage(
      "Sample photo updated locally. Nothing was uploaded to a server.",
    );
  }
  function details(key) {
    if (key === "name") return profile.name;
    if (key === "contacts")
      return (
        <>
          {profile.phone && (
            <>
              Phone: {profile.phone}
              <br />
            </>
          )}
          Email: {profile.email}
        </>
      );
    if (key === "social")
      return profile.linkedin || profile.website ? (
        <>
          {profile.linkedin}
          {profile.linkedin && profile.website && <br />}
          {profile.website}
        </>
      ) : (
        "No social links added"
      );
    return `${profile.language}, ${profile.currency}`;
  }
  function row(section) {
    return (
      <section
        className="settings-row"
        key={section.key}
        aria-labelledby={`settings-${section.key}-title`}
      >
        <div className="settings-row-content">
          <h3 id={`settings-${section.key}-title`}>{section.title}</h3>
          {editing === section.key ? (
            <form onSubmit={save}>
              {section.fields.map(([key, label, type]) => (
                <label key={key} htmlFor={`settings-${key}`}>
                  {label}
                  {Array.isArray(type) ? (
                    <select
                      id={`settings-${key}`}
                      value={draft[key]}
                      onChange={(event) =>
                        setDraft({ ...draft, [key]: event.target.value })
                      }
                    >
                      {type.map((value) => (
                        <option key={value}>{value}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      id={`settings-${key}`}
                      type={type}
                      value={draft[key]}
                      required={["name", "email"].includes(key)}
                      maxLength={key === "name" ? 100 : 254}
                      onChange={(event) => {
                        setDraft({ ...draft, [key]: event.target.value });
                        setMessage("");
                      }}
                    />
                  )}
                </label>
              ))}
              <div className="settings-actions">
                <button type="submit" disabled={!dirty}>
                  Save changes
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setDraft(profile);
                    setEditing("");
                    setMessage("Changes canceled.");
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <p>{details(section.key)}</p>
          )}
        </div>
        {editing !== section.key && (
          <button
            type="button"
            aria-label={`Edit ${section.title.toLowerCase()}`}
            onClick={() => edit(section.key)}
          >
            Edit
          </button>
        )}
      </section>
    );
  }

  return (
    <div className="settings-page">
      <header className="settings-heading">
        <h2>Settings & Administration</h2>
        <p>Manage your profile and personal preferences.</p>
      </header>
      <div className="settings-profile" data-theme={theme}>
        <div className="settings-photo-row">
          <div className="settings-avatar" aria-label="Profile photo">
            {photo ? (
              <img
                src={photo}
                alt="Sample profile"
                onError={() => {
                  setPhoto("");
                  setMessage(
                    "This image could not be displayed. Choose another image.",
                  );
                }}
              />
            ) : (
              <span>
                {profile.name
                  .split(/\s+/)
                  .filter(Boolean)
                  .slice(0, 2)
                  .map((part) => part[0])
                  .join("")
                  .toUpperCase()}
              </span>
            )}
          </div>
          <div className="settings-photo-actions">
            <button
              type="button"
              className="settings-photo-remove"
              disabled={!photo}
              aria-label="Remove sample photo"
              onClick={() => {
                setPhoto("");
                setMessage("Sample photo removed.");
              }}
            >
              <Trash2 size={17} />
            </button>
            <button type="button" onClick={() => upload.current?.click()}>
              <Upload size={16} /> Upload
            </button>
            <input
              ref={upload}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              hidden
              aria-label="Upload sample profile photo"
              onChange={choosePhoto}
            />
          </div>
        </div>
        {row(sections[0])}
        {row(sections[1])}
        <section
          className="settings-row settings-role-row"
          aria-labelledby="settings-role-title"
        >
          <div className="settings-row-content">
            <h3 id="settings-role-title">Role</h3>
            <p>
              <span className="settings-role-badge">
                <ShieldCheck size={14} /> Agent
              </span>
              <span className="settings-role-caption">Sample role</span>
            </p>
            <p className="settings-role-options">
              Available roles: Admin · Supervisor · Agent
            </p>
          </div>
          <span className="settings-readonly">
            <LockKeyhole size={13} /> Read-only
          </span>
        </section>
        {row(sections[2])}
        {row(sections[3])}

        <section className="settings-row">
          <div className="settings-row-content">
            <h3>Integration</h3>
            <p>No account connected</p>
          </div>
          <span className="settings-connection">Not connected</span>
        </section>
        <div className="settings-demo">
          <strong>Sample data · Frontend demo</strong>
          <p>
            Profile, photo, role, and preferences are local to this view and
            reset when you leave or reload. Roles grant no permissions. Account
            integrations are not connected.
          </p>
        </div>
        {message && (
          <p className="settings-message" role="status">
            {message}
          </p>
        )}
      </div>
    </div>
  );
}

import React, { useEffect, useRef, useState } from "react";
import {
  Upload,
  Trash2,
  ShieldCheck,
  LockKeyhole,
} from "lucide-react";
import "./Settings.css";

const API_URL = "http://localhost:5000/api/settings";       // API

const initialProfile = {
  name: "",
  email: "",
  phone: "",
  linkedin: "",
  website: "",
  language: "English",
  currency: "USD",
};

const sections = [
  {
    key: "name",
    title: "Name",
    fields: [["name", "Name", "text"]],
  },
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

  const [role, setRole] = useState("Agent");
  const [integrations, setIntegrations] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const upload = useRef(null);

  const dirty =
    JSON.stringify(draft) !== JSON.stringify(profile);

  // Fetch settings from backend
  useEffect(() => {
    const controller = new AbortController();

    async function fetchSettings() {
      try {
        setLoading(true);

        const response = await fetch(
          `${API_URL}/profile`,                   // ----------------For profile
          {
            credentials: "include",
            signal: controller.signal,
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch profile.");
        }

        const data = await response.json();

        const fetchedProfile = {
          name: data.name ?? "",
          email: data.email ?? "",
          phone: data.phone ?? "",
          linkedin: data.linkedin ?? "",
          website: data.website ?? "",
          language: data.language ?? "English",
          currency: data.currency ?? "USD",
        };

        setProfile(fetchedProfile);
        setDraft(fetchedProfile);
        setPhoto(data.photoUrl ?? "");
        setRole(data.role ?? "Agent");
      } catch (error) {
        if (error.name !== "AbortError") {
          setMessage(error.message);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    fetchSettings();

    return () => controller.abort();
  }, []);

  // Fetch role and integration information
  useEffect(() => {
    async function fetchAdditionalSettings() {
      try {
        const [rolesResponse, integrationsResponse] =
          await Promise.all([
            fetch(`${API_URL}/roles`, {                         // ---------------------- FOR Roles
              credentials: "include",
            }),
            fetch(`${API_URL}/integrations`, {                 // ----------------------For integrations
              credentials: "include",
            }),
          ]);

        if (rolesResponse.ok) {
          const data = await rolesResponse.json();
          if (data.currentRole) {
            setRole(data.currentRole);
          }
        }

        if (integrationsResponse.ok) {
          const data = await integrationsResponse.json();
          setIntegrations(data);
        }
      } catch (error) {
        console.error("Additional settings error:", error);
      }
    }

    fetchAdditionalSettings();
  }, []);

  // Protect unsaved changes
  useEffect(() => {
    registerPageGuard?.(
      () =>
        !dirty ||
        window.confirm("Discard unsaved profile changes?")
    );

    return () => registerPageGuard?.(null);
  }, [dirty, registerPageGuard]);

  function edit(key) {
    if (
      dirty &&
      !window.confirm("Discard unsaved profile changes?")
    ) {
      return;
    }

    setDraft(profile);
    setEditing(key);
    setMessage("");
  }

  // Save profile to backend
  async function save(event) {
    event.preventDefault();

    if (!draft.name.trim()) {
      setMessage("Enter a name.");
      return;
    }

    try {
      setSaving(true);
      setMessage("");

      const response = await fetch(`${API_URL}/profile`, {               // ----------------- Profile
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(draft),
      });

      if (!response.ok) {
        throw new Error("Failed to update profile.");
      }

      const data = await response.json();

      const updatedProfile = {
        ...draft,
        ...Object.fromEntries(
          Object.entries(data).filter(
            ([key]) => key in initialProfile
          )
        ),
      };

      setProfile(updatedProfile);
      setDraft(updatedProfile);
      setEditing("");

      setMessage("Profile updated successfully.");
    } catch (error) {
      setMessage(error.message);
    } finally {
      setSaving(false);
    }
  }

  // Upload photo to backend
  async function choosePhoto(event) {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) return;

    if (
      !["image/jpeg", "image/png", "image/webp"].includes(file.type) ||
      file.size > 5 * 1024 * 1024
    ) {
      setMessage("Choose JPG, PNG, or WebP up to 5 MB.");
      return;
    }

    const formData = new FormData();
    formData.append("photo", file);

    try {
      const response = await fetch(`${API_URL}/profile/photo`, {             // --------------------uplode the profile photo
        method: "POST",
        credentials: "include",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Photo upload failed.");
      }

      const data = await response.json();

      setPhoto(data.photoUrl);
      setMessage("Profile photo uploaded successfully.");
    } catch (error) {
      setMessage(error.message);
    }
  }

  // Remove photo from backend
  async function removePhoto() {
    try {
      const response = await fetch(                      // ---------------- Delete Photo
        `${API_URL}/profile/photo`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("Could not remove photo.");
      }

      setPhoto("");
      setMessage("Profile photo removed.");
    } catch (error) {
      setMessage(error.message);
    }
  }

  function details(key) {
    if (key === "name") return profile.name;

    if (key === "contacts") {
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
    }

    if (key === "social") {
      return profile.linkedin || profile.website ? (
        <>
          {profile.linkedin}
          {profile.linkedin && profile.website && <br />}
          {profile.website}
        </>
      ) : (
        "No social links added"
      );
    }

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
          <h3 id={`settings-${section.key}-title`}>
            {section.title}
          </h3>

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
                        setDraft({
                          ...draft,
                          [key]: event.target.value,
                        })
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
                        setDraft({
                          ...draft,
                          [key]: event.target.value,
                        });
                        setMessage("");
                      }}
                    />
                  )}
                </label>
              ))}

              <div className="settings-actions">
                <button type="submit" disabled={!dirty || saving}>
                  {saving ? "Saving..." : "Save changes"}
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

  if (loading) {
    return (
      <div className="settings-page">
        <p>Loading settings...</p>
      </div>
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
              <img src={photo} alt="Profile" />
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
              aria-label="Remove profile photo"
              onClick={removePhoto}
            >
              <Trash2 size={17} />
            </button>

            <button
              type="button"
              onClick={() => upload.current?.click()}
            >
              <Upload size={16} /> Upload
            </button>

            <input
              ref={upload}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              hidden
              aria-label="Upload profile photo"
              onChange={choosePhoto}
            />
          </div>
        </div>

        {row(sections[0])}
        {row(sections[1])}

        <section className="settings-row settings-role-row">
          <div className="settings-row-content">
            <h3>Role</h3>
            <p>
              <span className="settings-role-badge">
                <ShieldCheck size={14} /> {role}
              </span>
              <span className="settings-role-caption">
                Assigned role
              </span>
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

            {integrations.length ? (
              integrations.map((item) => (
                <p key={item.id}>
                  {item.name}: {item.connected ? "Connected" : "Not connected"}
                </p>
              ))
            ) : (
              <p>No account connected</p>
            )}
          </div>
        </section>

        <div className="settings-demo">
          <strong>Account settings</strong>
          <p>
            Profile, preferences, role, and integration information
            are retrieved from your backend.
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
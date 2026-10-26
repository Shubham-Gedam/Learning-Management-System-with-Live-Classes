
import { useState } from "react";
import { User, BriefcaseBusiness, BookOpen, FolderKanban, MapPin, Mail, Phone, CalendarDays, Pencil, Save, X } from "lucide-react";

export default function Profile() {
  const storedUser = JSON.parse(localStorage.getItem("user") || "null");
  const fullName = storedUser?.name || "";
  const nameParts = fullName.trim().split(/\s+/);

  const [activeTab, setActiveTab] = useState("Basic Info");
  const [editing, setEditing] = useState(false);
  const [profile, setProfile] = useState({
    firstName: nameParts[0] || "",
    lastName: nameParts.slice(1).join(" "),
    email: storedUser?.email || "",
    contact: "",
    dob: "",
    bio: "",
    city: "",
    state: "",
    pincode: "",
    country: "India",
  });
  const [draft, setDraft] = useState(profile);

  const tabs = [
    { label: "Basic Info", icon: User },
    { label: "Professional", icon: BriefcaseBusiness },
    { label: "Your Batches", icon: BookOpen },
    { label: "My Projects", icon: FolderKanban },
  ];

  function startEditing() {
    setDraft(profile);
    setEditing(true);
  }

  function cancelEditing() {
    setDraft(profile);
    setEditing(false);
  }

  function handleChange(event) {
    const { name, value } = event.target;
    setDraft((current) => ({ ...current, [name]: value }));
  }

  function handleSave(event) {
    event.preventDefault();
    setProfile(draft);
    setEditing(false);
  }
  

  const fields = [
    { label: "First Name", name: "firstName", icon: User },
    { label: "Last Name", name: "lastName", icon: User },
    { label: "Email Address", name: "email", icon: Mail, type: "email" },
    { label: "Contact Number", name: "contact", icon: Phone },
    { label: "Date of Birth", name: "dob", icon: CalendarDays, type: "date" },
    { label: "City", name: "city", icon: MapPin },
    { label: "State", name: "state", icon: MapPin },
    { label: "Pincode", name: "pincode", icon: MapPin },
    { label: "Country", name: "country", icon: MapPin },
  ];

  return (
    <main className="min-h-screen bg-[#0B0B0B] px-4 py-8 text-white sm:px-6 lg:px-12">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.25em] text-orange-500">
            Account Settings
          </p>
          <h1 className="text-3xl font-black sm:text-4xl">My Profile</h1>
          <p className="mt-2 text-sm text-neutral-400">
            Manage your personal information and learning profile.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
          <aside className="h-fit rounded-2xl border border-neutral-800 bg-neutral-900 p-6">
            <div className="flex flex-col items-center text-center">
              <div className="flex h-24 w-24 items-center justify-center rounded-full border-2 border-orange-500/50 bg-orange-500/10 text-3xl font-black text-orange-400">
                {(profile.firstName[0] || "U").toUpperCase()}
                {(profile.lastName[0] || "").toUpperCase()}
              </div>
              <h2 className="mt-4 text-lg font-bold">
                {[profile.firstName, profile.lastName].filter(Boolean).join(" ") || "Your Name"}
              </h2>
              <p className="mt-1 text-xs capitalize text-neutral-400">
                {storedUser?.role || "Student"}
              </p>
              <p className="mt-2 break-all text-xs text-neutral-500">{profile.email}</p>
            </div>

            <div className="my-6 border-t border-neutral-800" />

            <nav className="space-y-2">
              {tabs.map(({ label, icon: Icon }) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => setActiveTab(label)}
                  className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-semibold transition ${
                    activeTab === label
                      ? "border border-orange-500/20 bg-orange-500/10 text-orange-400"
                      : "text-neutral-400 hover:bg-neutral-800 hover:text-white"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </button>
              ))}
            </nav>
            
          </aside>

          <section className="rounded-2xl border border-neutral-800 bg-neutral-900 p-5 sm:p-8">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold">{activeTab}</h2>
                <p className="mt-1 text-sm text-neutral-400">
                  {activeTab === "Basic Info"
                    ? "Your personal information and contact details."
                    : `Your ${activeTab.toLowerCase()} information.`}
                </p>
              </div>

              {activeTab === "Basic Info" && !editing && (
                <button
                  type="button"
                  onClick={startEditing}
                  className="flex items-center gap-2 rounded-xl bg-orange-600 px-4 py-2.5 text-sm font-bold transition hover:bg-orange-500"
                >
                  <Pencil className="h-4 w-4" />
                  Edit Profile
                </button>
              )}
            </div>

            {activeTab === "Basic Info" ? (
              <form onSubmit={handleSave}>
                <div className="grid gap-5 sm:grid-cols-2">
                  {fields.map(({ label, name, icon: Icon, type = "text" }) => (
                    <label key={name} className="block">
                      <span className="mb-2 block text-xs font-semibold text-neutral-300">
                        {label}
                      </span>
                      <div className="flex items-center gap-3 rounded-xl border border-neutral-800 bg-[#111111] px-3 focus-within:border-orange-500/60">
                        <Icon className="h-4 w-4 shrink-0 text-neutral-500" />
                        <input
                          type={type}
                          name={name}
                          value={editing ? draft[name] : profile[name]}
                          onChange={handleChange}
                          readOnly={!editing || name === "email"}
                          required={name === "firstName" || name === "email"}
                          className="min-w-0 w-full bg-transparent py-3 text-sm text-white outline-none read-only:cursor-default"
                        />
                      </div>
                    </label>
                  ))}
                </div>

                <label className="mt-5 block">
                  <span className="mb-2 block text-xs font-semibold text-neutral-300">
                    Bio
                  </span>
                  <textarea
                    name="bio"
                    rows={4}
                    value={editing ? draft.bio : profile.bio}
                    onChange={handleChange}
                    readOnly={!editing}
                    placeholder="Tell us a little about yourself..."
                    className="w-full resize-y rounded-xl border border-neutral-800 bg-[#111111] p-4 text-sm text-white outline-none placeholder:text-neutral-600 focus:border-orange-500/60 read-only:cursor-default"
                  />
                </label>

                {editing && (
                  <div className="mt-6 flex flex-wrap justify-end gap-3">
                    <button
                      type="button"
                      onClick={cancelEditing}
                      className="flex items-center gap-2 rounded-xl border border-neutral-700 px-4 py-2.5 text-sm font-semibold text-neutral-300 transition hover:bg-neutral-800"
                    >
                      <X className="h-4 w-4" />
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex items-center gap-2 rounded-xl bg-orange-600 px-5 py-2.5 text-sm font-bold transition hover:bg-orange-500"
                    >
                      <Save className="h-4 w-4" />
                      Save Changes
                    </button>
                  </div>
                )}
              </form>
            ) : (
              <div className="rounded-xl border border-dashed border-neutral-700 bg-[#111111] p-8 text-center">
                {activeTab === "Professional" ? (
                  <BriefcaseBusiness className="mx-auto h-8 w-8 text-orange-400" />
                ) : activeTab === "Your Batches" ? (
                  <BookOpen className="mx-auto h-8 w-8 text-orange-400" />
                ) : (
                  <FolderKanban className="mx-auto h-8 w-8 text-orange-400" />
                )}
                <p className="mt-3 font-semibold">{activeTab}</p>
                <p className="mt-2 text-sm text-neutral-400">
                  This section will be connected to your LMS data in the next step.
                </p>
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}

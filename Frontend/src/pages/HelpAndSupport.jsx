import React, { useState } from "react";
import {
  LifeBuoy,
  MessageSquare,
  FileText,
  Mail,
  Phone,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Search,
  BookOpen,
  Send,
} from "lucide-react";
import "./HelpAndSupport.css";

function HelpAndSupport({ onNavigate }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [openFaq, setOpenFaq] = useState(null);
  const [contactSubject, setContactSubject] = useState("");
  const [contactMessage, setContactMessage] = useState("");
  const [ticketSuccess, setTicketSuccess] = useState(false);

  const faqs = [
    {
      q: "How do I create and track a support ticket?",
      a: "Navigate to 'Support Requests' from the sidebar. Click 'New Ticket' to enter the title, description, and priority level. Once submitted, tickets are assigned an ID and tracked in real-time.",
    },
    {
      q: "How can agents communicate via Live Chat?",
      a: "Open 'Conversations & Live Chat' to view active customer chats. Click any conversation from the list on the left to review chat history and reply directly in the chat panel.",
    },
    {
      q: "How do I manage customer accounts and subscription plans?",
      a: "Go to 'Customer Management'. You can filter customers by subscription plan (Free, Pro, Enterprise) or account status, search by name/email/phone, and add or update customer records.",
    },
    {
      q: "Where can I find documentation and knowledge articles?",
      a: "Visit the 'Knowledge Base' section from the sidebar. You can browse published categories, read help articles, or draft new articles with custom slugs and summaries.",
    },
    {
      q: "How do I generate and export analytics reports?",
      a: "Click 'Reports & Analytics' to review KPI metrics, ticket volume charts, and agent resolution times. Use the date range filters to customize your reporting interval and export data.",
    },
    {
      q: "How do I update my profile details and role preferences?",
      a: "Click your profile avatar in the top right header or select 'Settings & Administration' in the sidebar to edit your name, contact email, phone, and system role.",
    },
  ];

  const filteredFaqs = faqs.filter(
    (faq) =>
      faq.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.a.toLowerCase().includes(searchQuery.toLowerCase())
  );

  function toggleFaq(index) {
    setOpenFaq(openFaq === index ? null : index);
  }

  function handleQuickTicket(e) {
    e.preventDefault();
    if (!contactSubject.trim() || !contactMessage.trim()) return;
    setTicketSuccess(true);
    setContactSubject("");
    setContactMessage("");
    setTimeout(() => setTicketSuccess(false), 5000);
  }

  return (
    <div className="help-page">
      <div className="help-header">
        <h1>Help & Support Center</h1>
        <p>Find answers to common questions, explore guides, or contact our support team.</p>
      </div>

      {/* Search Header */}
      <div className="help-search-box">
        <Search size={22} className="help-search-icon" />
        <input
          type="text"
          placeholder="Search help topics, FAQs, and documentation..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Quick Action Support Cards */}
      <div className="help-cards-grid">
        <div
          className="help-card"
          onClick={() => onNavigate && onNavigate("support")}
        >
          <div className="help-card-icon" style={{ backgroundColor: "#4f46e5" }}>
            <FileText size={24} color="white" />
          </div>
          <h3>Support Requests</h3>
          <p>Submit a new ticket, check status, or manage open requests.</p>
          <span className="help-card-link">Go to Tickets &rarr;</span>
        </div>

        <div
          className="help-card"
          onClick={() => onNavigate && onNavigate("conversations")}
        >
          <div className="help-card-icon" style={{ backgroundColor: "#0284c7" }}>
            <MessageSquare size={24} color="white" />
          </div>
          <h3>Live Chat Support</h3>
          <p>Chat directly with agents and customers in real time.</p>
          <span className="help-card-link">Open Live Chat &rarr;</span>
        </div>

        <div
          className="help-card"
          onClick={() => onNavigate && onNavigate("knowledge")}
        >
          <div className="help-card-icon" style={{ backgroundColor: "#16a34a" }}>
            <BookOpen size={24} color="white" />
          </div>
          <h3>Knowledge Base</h3>
          <p>Read troubleshooting articles, category guides, and solutions.</p>
          <span className="help-card-link">Browse Articles &rarr;</span>
        </div>

        <div className="help-card status-card">
          <div className="help-card-icon" style={{ backgroundColor: "#10b981" }}>
            <CheckCircle2 size={24} color="white" />
          </div>
          <h3>System Status</h3>
          <p>All CRM services, APIs, and databases are operational.</p>
          <span className="system-status-pill">
            <span className="online-dot" /> Operational
          </span>
        </div>
      </div>

      {/* Main Content Layout: FAQs and Contact */}
      <div className="help-main-layout">
        {/* FAQs */}
        <div className="help-faq-section">
          <h2>Frequently Asked Questions</h2>
          <div className="faq-list">
            {filteredFaqs.length === 0 ? (
              <p className="no-faqs">No topics matched your search query.</p>
            ) : (
              filteredFaqs.map((faq, index) => {
                const isOpen = openFaq === index;
                return (
                  <div
                    key={faq.q}
                    className={`faq-item ${isOpen ? "open" : ""}`}
                  >
                    <button
                      className="faq-question"
                      onClick={() => toggleFaq(index)}
                      type="button"
                    >
                      <span>{faq.q}</span>
                      {isOpen ? (
                        <ChevronUp size={20} />
                      ) : (
                        <ChevronDown size={20} />
                      )}
                    </button>
                    {isOpen && <div className="faq-answer">{faq.a}</div>}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Quick Contact & Assistance Sidebar */}
        <div className="help-contact-section">
          <h2>Contact Support</h2>
          <p className="contact-sub">
            Need additional assistance? Reach out to our 24/7 technical team.
          </p>

          <div className="contact-methods">
            <div className="contact-item">
              <Mail size={20} className="contact-icon" />
              <div>
                <h4>Email Support</h4>
                <p>support@crmsupportflow.com</p>
              </div>
            </div>

            <div className="contact-item">
              <Phone size={20} className="contact-icon" />
              <div>
                <h4>Phone Assistance</h4>
                <p>+1 (800) 555-0199</p>
              </div>
            </div>

            <div className="contact-item">
              <LifeBuoy size={20} className="contact-icon" />
              <div>
                <h4>Response Time</h4>
                <p>Average response within 15 mins</p>
              </div>
            </div>
          </div>

          {/* Quick Ticket Submission Box */}
          <form className="quick-help-form" onSubmit={handleQuickTicket}>
            <h3>Send a Message</h3>
            {ticketSuccess && (
              <div className="help-alert-success">
                Thank you! Your inquiry has been sent to our support team.
              </div>
            )}
            <input
              type="text"
              placeholder="Subject / Summary"
              value={contactSubject}
              onChange={(e) => setContactSubject(e.target.value)}
              required
            />
            <textarea
              placeholder="Describe your issue or question..."
              rows={4}
              value={contactMessage}
              onChange={(e) => setContactMessage(e.target.value)}
              required
            />
            <button type="submit" className="help-submit-btn">
              <Send size={16} />
              <span>Send Message</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default HelpAndSupport;

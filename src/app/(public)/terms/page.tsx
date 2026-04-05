import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms & Conditions — todoMasterAI",
  description: "Terms and conditions for using todoMasterAI.",
};

const sections = [
  {
    title: "1. Introduction",
    content:
      "Welcome to todoMasterAI. These Terms of Service govern your use of our website and application. By accessing or using todoMasterAI, you agree to be bound by these terms.",
  },
  {
    title: "2. Acceptance of Terms",
    content:
      "By creating an account or using todoMasterAI, you acknowledge that you have read, understood, and agree to these terms. If you do not agree, please do not use our service.",
  },
  {
    title: "3. Description of Service",
    content:
      "todoMasterAI is a free, AI-powered task management application. The service includes todo list creation, task management, calendar views, kanban boards, data export/import, and offline functionality. All features are provided free of charge with no premium tier.",
  },
  {
    title: "4. User Accounts",
    content:
      "You are responsible for maintaining the confidentiality of your account credentials. You must provide accurate information when creating an account. You are responsible for all activities that occur under your account.",
  },
  {
    title: "5. User Responsibilities",
    content:
      "You agree to use todoMasterAI only for lawful purposes. You shall not attempt to gain unauthorized access to any part of the service, interfere with the proper working of the service, or use the service to store or transmit harmful content.",
  },
  {
    title: "6. Intellectual Property",
    content:
      "The todoMasterAI application, including its design, code, and content, is protected by intellectual property laws. You retain full ownership of any data you create within the application.",
  },
  {
    title: "7. Privacy",
    content:
      "Your privacy is important to us. Please review our Privacy Policy for information about how we collect, use, and protect your personal data. We do not sell or share your data with third parties for advertising purposes.",
  },
  {
    title: "8. Data Export & Deletion",
    content:
      "You can export all your data at any time in JSON format. You can request complete deletion of your account and all associated data by contacting us. We will process deletion requests within 24 hours.",
  },
  {
    title: "9. Limitation of Liability",
    content:
      'todoMasterAI is provided "as is" without warranties of any kind. We shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the service.',
  },
  {
    title: "10. Changes to Terms",
    content:
      "We may update these terms from time to time. We will notify users of significant changes via email or in-app notification. Continued use of the service after changes constitutes acceptance of the new terms.",
  },
  {
    title: "11. Contact",
    content:
      "If you have questions about these terms, please contact us at support@todoMasterAI.app or visit our Contact page.",
  },
];

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:py-16">
      <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900">Terms & Conditions</h1>
      <p className="mt-3 text-sm text-gray-500">Last updated: April 2026</p>

      <div className="mt-8 space-y-8">
        {sections.map((s) => (
          <div key={s.title}>
            <h2 className="text-lg font-bold text-gray-900">{s.title}</h2>
            <p className="mt-2 text-base text-gray-600 leading-relaxed">{s.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

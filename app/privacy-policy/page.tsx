'use client'

export default function PrivacyPolicy() {
  return (
    <main className="min-h-screen bg-white font-sans">

      {/* NAVBAR */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 md:px-12 h-14 md:h-16 bg-white border-b border-green-100 shadow-sm">
        <a href="/" className="text-xl md:text-2xl font-extrabold text-green-700 tracking-tight">
          cucumber<span className="text-green-400">.</span>
        </a>
        <a href="/" className="text-xs md:text-sm font-semibold text-gray-500 hover:text-green-700 transition-colors">
          ← Back to home
        </a>
      </nav>

      <div className="pt-24 pb-16 px-4 md:px-16 max-w-3xl mx-auto">

        {/* Header */}
        <div className="mb-10">
          <div className="text-xs font-bold text-green-500 uppercase tracking-widest mb-3">Legal</div>
          <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 mb-4">Privacy Policy</h1>
          <p className="text-sm text-gray-400">Last updated: April 2026</p>
        </div>

        <div className="prose prose-sm max-w-none text-gray-600 space-y-8">

          <div className="bg-green-50 border border-green-100 rounded-2xl p-5">
            <p className="text-sm text-green-700 font-medium leading-relaxed">
              Cucumber Travel is committed to protecting your privacy. This policy explains what information we collect, how we use it, and your rights regarding your personal data.
            </p>
          </div>

          <section>
            <h2 className="text-xl font-extrabold text-gray-900 mb-3">1. What We Collect</h2>
            <p className="text-sm leading-relaxed mb-3">When you create an account or join a trip on Cucumber, we collect:</p>
            <ul className="space-y-2 text-sm">
              {[
                'Full name and username',
                'Email address',
                'Phone number (for WhatsApp trip updates)',
                'Age group and gender (for trip matching)',
                'Government ID documents (for identity verification only)',
                'Payment information (processed securely by Razorpay — we never store card details)',
                'Device and browser information for security purposes',
              ].map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <span className="text-green-500 mt-0.5">✓</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-extrabold text-gray-900 mb-3">2. How We Use Your Information</h2>
            <p className="text-sm leading-relaxed mb-3">We use your information to:</p>
            <ul className="space-y-2 text-sm">
              {[
                'Create and manage your Cucumber account',
                'Match you with compatible travel rooms based on age group and gender preference',
                'Send trip updates, confirmations and reminders via WhatsApp and email',
                'Process payments and refunds securely',
                'Verify your identity for safety of all travelers',
                'Improve our platform and services',
                'Comply with legal obligations',
              ].map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <span className="text-green-500 mt-0.5">✓</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-extrabold text-gray-900 mb-3">3. What We Never Do</h2>
            <ul className="space-y-2 text-sm">
              {[
                'We never sell your personal data to third parties',
                'We never share your phone number or email with other travelers without your consent',
                'We never store your payment card details — all payments are handled by Razorpay',
                'We never use your ID documents for any purpose other than identity verification',
                'We never send spam or unsolicited marketing messages',
              ].map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <span className="text-red-400 mt-0.5">✕</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-extrabold text-gray-900 mb-3">4. Who We Share Data With</h2>
            <p className="text-sm leading-relaxed mb-3">We only share your data with trusted service providers who help us operate:</p>
            <div className="space-y-3">
              {[
                { name: 'Supabase', purpose: 'Secure database storage — hosted in secure servers' },
                { name: 'Razorpay', purpose: 'Payment processing — PCI DSS compliant' },
                { name: 'Twilio', purpose: 'WhatsApp notifications for trip updates' },
                { name: 'Resend', purpose: 'Email confirmations and updates' },
                { name: 'Vercel', purpose: 'Website hosting' },
              ].map((service) => (
                <div key={service.name} className="flex items-start gap-3 bg-gray-50 rounded-xl p-3">
                  <div className="font-bold text-gray-900 text-sm w-24 flex-shrink-0">{service.name}</div>
                  <div className="text-sm text-gray-500">{service.purpose}</div>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-xl font-extrabold text-gray-900 mb-3">5. Data Security</h2>
            <p className="text-sm leading-relaxed">
              We take security seriously. Your data is stored on encrypted servers, all connections use HTTPS, and access to your data is strictly limited. We use Supabase Row Level Security to ensure users can only access their own data. Payment data is handled exclusively by Razorpay and is never stored on our servers.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-extrabold text-gray-900 mb-3">6. Your Rights</h2>
            <p className="text-sm leading-relaxed mb-3">You have the right to:</p>
            <ul className="space-y-2 text-sm">
              {[
                'Access all personal data we hold about you',
                'Correct any inaccurate information',
                'Request deletion of your account and data',
                'Opt out of WhatsApp or email communications',
                'Withdraw consent at any time',
              ].map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <span className="text-green-500 mt-0.5">✓</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <p className="text-sm leading-relaxed mt-3">
              To exercise any of these rights, contact us on Instagram <a href="https://instagram.com/cucumbertravel.in" target="_blank" className="text-green-600 font-semibold">@cucumbertravel.in</a>
            </p>
          </section>

          <section>
            <h2 className="text-xl font-extrabold text-gray-900 mb-3">7. Cookies</h2>
            <p className="text-sm leading-relaxed">
              We use essential cookies only — these are required for the website to function (keeping you logged in, security). We do not use advertising or tracking cookies.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-extrabold text-gray-900 mb-3">8. Children's Privacy</h2>
            <p className="text-sm leading-relaxed">
              Cucumber is strictly for users aged 18 and above. We do not knowingly collect data from minors. If we discover a user is under 18, their account will be immediately deleted.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-extrabold text-gray-900 mb-3">9. Changes to This Policy</h2>
            <p className="text-sm leading-relaxed">
              We may update this policy from time to time. We will notify you of any significant changes via email or WhatsApp. Continued use of Cucumber after changes means you accept the updated policy.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-extrabold text-gray-900 mb-3">10. Contact Us</h2>
            <p className="text-sm leading-relaxed">
              For any privacy concerns or questions, reach us on Instagram{' '}
              <a href="https://instagram.com/cucumbertravel.in" target="_blank" className="text-green-600 font-semibold hover:underline">
                @cucumbertravel.in
              </a>
            </p>
          </section>

          <div className="bg-gray-50 border border-gray-100 rounded-2xl p-5 mt-8">
            <p className="text-xs text-gray-400 leading-relaxed text-center">
              © 2026 Cucumber Travel · Made with 🥒 in India · All rights reserved
            </p>
          </div>

        </div>
      </div>
    </main>
  )
}
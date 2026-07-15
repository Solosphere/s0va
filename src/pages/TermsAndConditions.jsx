import { useEffect } from "react";

const SECTIONS = [
  {
    n: "01",
    title: "Intellectual Property",
    body:
      "All content on this website, including but not limited to text, images, graphics, designs, and code, is the intellectual property of Daniel Nelson unless otherwise stated. Unauthorized use, reproduction, or distribution of any content without prior permission is strictly prohibited.",
  },
  {
    n: "02",
    title: "Permitted Use",
    body: "You may browse this site and share links to its content for personal, non-commercial purposes. However, you may not:",
    list: [
      "Modify, copy, or redistribute any content without written consent.",
      "Use the website for unlawful or harmful activities.",
      "Claim ownership of any materials found on this website.",
    ],
  },
  {
    n: "03",
    title: "Limitation of Liability",
    body:
      "The content on this website is provided for informational and portfolio purposes only. Daniel Nelson makes no warranties regarding the accuracy, completeness, or reliability of any content. Use of this site is at your own risk.",
  },
  {
    n: "04",
    title: "External Links",
    body:
      "This website may contain links to third-party sites. Daniel Nelson is not responsible for the content, privacy policies, or practices of any external websites.",
  },
  {
    n: "05",
    title: "Privacy Policy",
    body:
      "This website does not collect personal data unless explicitly stated. Any analytics or third-party services used comply with applicable privacy laws.",
  },
  {
    n: "06",
    title: "Changes to Terms",
    body:
      "Daniel Nelson reserves the right to update these Terms and Conditions at any time without notice. It is your responsibility to review them periodically.",
  },
];

const TermsAndConditions = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="terms-page">
      <header className="terms-header">
        <h1 className="terms-title">TERMS &amp; CONDITIONS</h1>
        <p className="terms-prompt">
          <span className="terms-prompt-sign" aria-hidden="true">root@mettaire.os ~ %</span>{' '}
          cat /var/legal/terms.txt
        </p>
        <p className="terms-stamp">
          <span className="terms-stamp-key">&gt; STAMP</span>
          <span className="terms-stamp-value">2025-08-15</span>
        </p>
      </header>

      <section className="terms-body">
        <p className="terms-intro">
          Welcome to METTAIRE. By accessing or using this website, you agree to be
          bound by these Terms and Conditions. If you do not agree with any part
          of these terms, please do not use this website.
        </p>

        {SECTIONS.map((s) => (
          <article key={s.n} className="terms-section">
            <h2 className="terms-section-heading">
              <span className="terms-section-num">[ {s.n} ]</span>
              <span className="terms-section-name">{s.title}</span>
            </h2>
            <p className="terms-section-body">{s.body}</p>
            {s.list && (
              <ul className="terms-section-list">
                {s.list.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            )}
          </article>
        ))}

        <article className="terms-section">
          <h2 className="terms-section-heading">
            <span className="terms-section-num">[ 07 ]</span>
            <span className="terms-section-name">Contact</span>
          </h2>
          <p className="terms-section-body">
            If you have any questions about these Terms and Conditions, please
            contact me at{' '}
            <a href="mailto:lukannelson@gmail.com" className="terms-mail">
              lukannelson@gmail.com
            </a>
            .
          </p>
        </article>

        <p className="terms-eof" aria-hidden="true">— END OF FILE —</p>
      </section>
    </div>
  );
};

export default TermsAndConditions;

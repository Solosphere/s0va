// Engineering Log — STAR-format work-experience entries.
//
// Each entry condenses a real project into a recruiter-readable narrative:
//   summary      one-line hook shown on the card
//   problem      the situation / why it mattered
//   constraints  the role + constraints (the "task" in STAR)
//   approach     the actions taken (bullet steps)
//   architecture optional ascii diagram (rendered monospace, on-brand)
//   outcome      the result + business impact
//   reflection   first-person takeaway — the narrative recruiters connect with
//
// Ordered strongest-first (not strictly chronological); each card still shows
// its org + period so the timeline reads clearly.

export const logMeta = {
  role: 'Software Engineering AMTS · Salesforce / OWN',
  timeline:
    'Intern @ OWN (Aug 2024 – Feb 2025) → AMTS @ Salesforce (Feb 2025 – Present)',
  stack: [
    'AWS', 'GovCloud', 'Terraform', 'Ansible', 'Jenkins', 'Packer',
    'Python', 'Lambda', 'Datadog', 'CrowdStrike', 'Tenable', 'GitLab',
    'ArgoCD', 'Splunk/SIEM', 'Linux',
  ],
};

const caseStudies = [
  {
    id: 'supply-chain-incident-response',
    title: 'Supply Chain Incident Response',
    org: 'Salesforce',
    period: 'Feb 2025 – Present',
    stack: ['CrowdStrike Falcon', 'GitLab API', 'Nexus IQ', 'GitHub Actions', 'Incident Response'],
    summary:
      'Led the org-wide investigation when axios@1.14.1 shipped malware — scanned 62+ GitLab projects in hours and confirmed zero compromise under TLP:RED.',
    problem:
      'A poisoned axios@1.14.1 and its malware dependency plain-crypto-js@4.2.1 were disclosed while scheduled CI/CD jobs were actively running. We needed to know within hours whether any of 62+ GitLab projects or GitHub Actions had pulled the malicious package.',
    constraints:
      'Led the investigation for the Trusted Services team under TLP:RED — exposure had to be assessed and reported to VP-level leadership and the Security Architect within the same business day.',
    approach: [
      'Scanned all 62 GitLab projects with CrowdStrike Falcon Code Search and the GitLab API /trace endpoint for npm/yarn install activity in the compromise window.',
      'Narrowed to 7 priority repos using caret ranges (^1.x) that could resolve to the poisoned version.',
      'Confirmed archiver-supervisor jobs attempted to fetch the malware via yarn install — and that Nexus IQ Firewall auto-blocked it (403, Security-Malicious policy) before the payload landed.',
      'Verified datadog-ci ran as a standalone binary (safe) and that no GitHub Actions workflow used npm install.',
      'Produced two formal evidence documents for the security incident channel.',
    ],
    architecture: `disclosure event
  └─ Falcon Code Search ── 62 repos scanned
     └─ GitLab API /trace ── 7 priority repos deep-dived
        └─ Nexus IQ logs ── plain-crypto-js blocked (403)
           └─ GitHub Actions ── no npm workflows
              └─ finding: no compromise · evidence logged`,
    outcome:
      'Confirmed zero compromise across the org and delivered an evidence-backed finding to VP and Security Architect inside the incident window. The Nexus IQ Firewall investment proved itself by blocking the malware automatically — and the work shipped audit-ready.',
    reflection:
      "Highest-stakes work of my first year, with leadership watching. What made it work wasn't speed, it was methodology: define the attack surface, enumerate every vector, and document every step as you go so you can hand off a complete picture the moment it matters.",
  },
  {
    id: 'nat-refresh-pipeline',
    title: 'FedRAMP NAT Refresh Automation Pipeline',
    org: 'Salesforce',
    period: 'Feb 2025 – Present',
    stack: ['Jenkins', 'Packer', 'Terraform', 'AWS GovCloud', 'Linux', 'kpatch'],
    summary:
      'Built a rolling, AZ-by-AZ NAT instance refresh pipeline for FedRAMP GovCloud — AMI-baked kernel patches with zero outbound-connectivity loss.',
    problem:
      "OWN's FedRAMP GovCloud relied on singleton NAT instances for outbound routing that needed periodic refresh for kernel patching and compliance — but there was no automated, safe way to do it. Cut the wrong instance and you sever outbound connectivity for the whole environment. It was also unclear whether live kernel patching (kpatch) was even viable.",
    constraints:
      'Sole engineer from research through production cutover, in a FedRAMP environment with zero tolerance for unplanned outages. Jenkins agents ran in the very environment being modified — a subtle self-disruption risk.',
    approach: [
      "Ran a kpatch POC and found the running kernel fell between Red Hat's quarterly release boundaries with zero kpatch content available — produced a documented no-go and closed the spike.",
      'Wrote a Jenkins + Packer pipeline to bake a NAT AMI with the patched kernel, making fixes durable across ASG instance replacements (PR #176).',
      'Pointed ASG launch templates at the new AMI via Terraform (PR #558).',
      'Built a rolling, AZ-by-AZ refresh pipeline that launches the replacement before terminating the old instance, with a post-cutover connectivity checklist — IP forwarding, MASQUERADE iptables, pod reachability (PR #179).',
      'Fixed a Jenkins agent that severed itself mid-refresh by making the polling logic reconnect-tolerant (PR #188), then ran a clean live cutover on AZ 1C — zero pod restarts, zero Datadog alerts.',
    ],
    architecture: `kernel CVE / compliance trigger
  └─ Packer build ── baked NAT AMI (kernel patched)
     └─ Terraform ── ASG launch template → new AMI
        └─ Jenkins: nat_instance_refresh_fedramp
           ├─ select target NAT (per AZ)
           ├─ launch new before terminating old
           ├─ validate (IP fwd · iptables · pods)
           └─ terminate old
              └─ Datadog + manual verify ── clean`,
    outcome:
      'A fully automated, safe NAT refresh pipeline operational in FedRAMP GovCloud. Rolling execution removes single-point connectivity loss, baked AMIs make patches self-inheriting on future ASG replacements, and the agent reconnect fix cleared a blocker that only surfaced under real cutover.',
    reflection:
      "The kpatch dead-end was one of the most valuable parts — going deep enough to confidently say 'this won't work here' protected the team from building on a shaky foundation. And the Jenkins agent bug only appeared because I ran the pipeline in the same environment it was modifying: the kind of edge case you only find in production.",
  },
  {
    id: 'csoc-log-integration',
    title: 'FedRAMP CSOC Log Integration',
    org: 'Salesforce / OWN',
    period: 'Feb 2025 – Present',
    stack: ['CloudTrail', 'GuardDuty', 'CrowdStrike FDR', 'Okta', 'Splunk/SIEM', 'Terraform'],
    summary:
      "Owned OWN's FedRAMP side of a cross-team integration piping CloudTrail, GuardDuty, CrowdStrike FDR and Okta logs into Salesforce's CSOC/SIEM — closing GovCloud security blind spots.",
    problem:
      "OWN's FedRAMP environment had siloed security logs — CloudTrail, GuardDuty, CrowdStrike FDR, Okta, VPC Flow Logs — none integrated into Salesforce's Centralized Security Operations Center. That meant detection blind spots, slower incident response, and FedRAMP audit risk for insufficient continuous monitoring.",
    constraints:
      "OWN's point-of-contact engineer, working cross-functionally with Salesforce's Trust Intelligence Platform (TIP) team. TIP owned the ingestion side; I owned the OWN FedRAMP side — log sources, S3 delivery, and pipeline correctness. All in GovCloud.",
    approach: [
      'Configured CloudTrail to deliver to the ogc-security-logs S3 bucket for TIP ingestion.',
      'Stood up the CrowdStrike Falcon Data Replicator (FDR) export into the CSOC bucket.',
      'Configured Okta log export to S3 with correct routing.',
      'Drove GuardDuty from dev through prod promotion with TIP — logs officially went live in Asgard/Splunk.',
      'Expanded prod VPC Flow Log retention to 365 days for FedRAMP, and codified the S3 bucket in Terraform (PR #743).',
    ],
    architecture: `FedRAMP log sources
  ├─ CloudTrail
  ├─ CrowdStrike FDR    ──→  ogc-security-logs S3 (GovCloud)
  ├─ Okta                     └─ TIP platform → Asgard/Splunk SIEM
  └─ GuardDuty                    └─ CSOC analysts
VPC Flow Logs → 365-day retention`,
    outcome:
      "3 of 4 targeted log types fully integrated into the CSOC production bucket, GuardDuty live in Splunk, and VPC Flow retention meeting the FedRAMP 365-day bar. OWN's GovCloud security blind spot eliminated, directly supporting the FedRAMP ATO and continuous-monitoring requirements.",
    reflection:
      'My first major cross-team, cross-org project — coordinating with four senior TIP engineers who owned the SIEM while I owned the OWN side. It taught me what a real dependency on another team feels like, and how to keep things moving with clear async status updates without blocking anyone.',
  },
  {
    id: 'datadog-gus-alerting',
    title: 'Datadog → GUS Alerting Integration',
    org: 'Salesforce',
    period: 'Feb 2025 – Present',
    stack: ['OAuth 2.0', 'Connected App', 'Datadog', 'Webhooks', 'GUS API'],
    summary:
      "Wired Datadog alerts straight into Salesforce's GUS via OAuth 2.0 Client Credentials and webhooks across commercial and FedRAMP — killing manual alert-to-ticket triage.",
    problem:
      'Datadog monitors fired with no path into GUS, where the team tracked operational work. Engineers manually translated alerts into tickets — slow, error-prone, and alerts slipped through untracked.',
    constraints:
      'Sole engineer, navigating Salesforce internal tooling. GUS uses a Connected App for service-to-service auth, and the webhooks had to work across two distinct environments (commercial + FedRAMP) with different endpoints. OAuth 2.0 Client Credentials was new territory.',
    approach: [
      'Registered a GUS Connected App to enable OAuth 2.0 Client Credentials auth — letting Datadog authenticate as a trusted service with no user login.',
      'Wired the flow: Datadog exchanges client_id/secret for an access token, then calls the GUS API with it.',
      'Configured Datadog webhooks in both commercial and FedRAMP to POST alert payloads on monitor state changes.',
      'Mapped alert metadata (monitor, severity, status, URL) to the right GUS fields, routing to the support dashboard.',
      'Validated end-to-end in both environments.',
    ],
    architecture: `Datadog monitor (commercial + FedRAMP)
  └─ webhook on alert state change
     └─ OAuth 2.0 client credentials
        └─ GUS Connected App ── access token issued
           └─ authenticated POST → GUS API
              └─ alert on support dashboard ── actionable`,
    outcome:
      'Datadog alerts now surface directly on the GUS support dashboard in both commercial and FedRAMP, immediately actionable with no manual translation — closing the gap between observability and work tracking and cutting mean time to acknowledge (MTTA).',
    reflection:
      'The OAuth 2.0 Client Credentials handshake was the most interesting part — service-to-service trust established at the app level, not the user level. Getting it right across two regulated environments with different endpoints took careful config. The result looks deceptively simple — alerts just show up — but the plumbing spans two platforms and two regulated environments.',
  },
  {
    id: 'fedramp-vuln-remediation',
    title: 'FedRAMP Vulnerability Remediation',
    org: 'Salesforce / OWN',
    period: 'Feb 2025 – Present',
    stack: ['Tenable', 'Linux', 'dnf / RPM', 'AWS GovCloud', 'FedRAMP'],
    summary:
      "Closed Tenable-flagged CVEs across FedRAMP EC2 fleets within assigned SLAs — hands-on Linux patching that kept OWN's authorization posture clean.",
    problem:
      "The Threat & Vulnerability Management (TVM) team regularly flagged CVEs on EC2 assets across OWN's FedRAMP environments via Tenable, each with an assigned SLA. Miss them and you risk POA&M findings, audit gaps, and FedRAMP authorization issues.",
    constraints:
      "Primary engineer for assigned findings, in FedRAMP GovCloud where a careless reboot or broken package state on a production host isn't an option. Required Linux + RPM proficiency and enough security context to weigh each CVE's actual risk.",
    approach: [
      'Took CVE findings from TVM with severity and SLA from Tenable scan reports.',
      'SSH’d into each impacted host and ran targeted dnf update <package> to pull the remediated version.',
      'Verified post-patch versions met or exceeded the RHSA-specified fix.',
      'Confirmed no service disruption via logs and connectivity checks.',
      'Reported back for Tenable re-scan and finding closure.',
    ],
    architecture: `Tenable scan → CVE finding (RHSA · severity · SLA)
  └─ TVM team ── assigns to engineer
     └─ SSH into impacted EC2 host
        └─ dnf update <affected-package>
           └─ verify version + service check
              └─ TVM re-scan ── finding closed within SLA`,
    outcome:
      "CVE findings closed within TVM SLAs across FedRAMP EC2 hosts, preventing POA&M accumulation and keeping OWN's authorization posture clean — direct vulnerability ownership, not just automation.",
    reflection:
      "This sits at the security/ops intersection a lot of SWEs never touch. It's not glamorous — SSH in, update packages — but understanding why a CVE matters, what it exposes, and verifying the fix actually landed takes real security literacy. A FedRAMP environment makes every action feel accountable.",
  },
  {
    id: 'falcon-sensor-coverage',
    title: 'CrowdStrike Falcon Sensor Coverage',
    org: 'Salesforce / OWN',
    period: 'Feb 2025 – Present',
    stack: ['CrowdStrike Falcon', 'EKS', 'ArgoCD', 'AWS', 'kubectl', 'Linux'],
    summary:
      'Closed CrowdStrike coverage gaps across 6+ EKS clusters and multiple AWS accounts — separating real gaps from false positives and tracing them to missing ArgoCD daemonsets.',
    problem:
      "A compliance report flagged multiple EKS nodes and EC2 instances across OWN's AWS accounts as lacking CrowdStrike Falcon coverage — a control required everywhere, including FedRAMP. A GovCloud host was also under investigation for Falcon network containment suspected of causing severe slowness.",
    constraints:
      'Spanned multiple AWS accounts, two ArgoCD instances (prod + staging), and cross-team coordination with Endpoint Protection. Had to distinguish false positives (AWS-managed EKS nodes where Falcon deploys differently) from genuine gaps.',
    approach: [
      'SSH’d into flagged EC2 instances and confirmed via falconctl -g --aid + systemctl that all 6 were running Falcon (report false positives).',
      'Checked EKS clusters with kubectl get pods -A | grep falcon — found stg/prod-ob-mgmt had zero Falcon pods and weren’t registered in ArgoCD at all.',
      'Identified the ArgoCD apps needed to deploy Falcon daemonsets across archiver (CA, UK) and local clusters.',
      'Surfaced ownership/lifecycle questions on dev01-esbs-eks and devops-ci clusters.',
      'Opened an AWS Support case correlating CrowdStrike’s networkcontain_nf kernel module with GovCloud network degradation.',
    ],
    architecture: `CrowdStrike compliance report
  ├─ EC2 instances ── verified running (false positives)
  └─ EKS clusters (multi-account)
     ├─ stg/prod-ob-mgmt ── not in ArgoCD ── no daemonset
     └─ archiver-ca1 · archiver-uk1 · local
        └─ ArgoCD sync ── falcon daemonset ── gap closed`,
    outcome:
      'Closed Falcon coverage gaps across multiple prod and staging EKS clusters, separated genuine gaps from false positives to avoid wasted effort, and uncovered a broader ArgoCD registration gap with implications beyond security tooling.',
    reflection:
      'The hardest part was the false positives — real gaps mixed in with hosts that were actually fine. Verifying directly at the host level instead of trusting report output was the key lesson, and it drove home that ArgoCD is the source of truth: if a cluster isn’t registered, nothing gets managed — not just CrowdStrike.',
  },
  {
    id: 'ec2-reboot-alerting',
    title: 'EC2 Reboot Alerting System',
    org: 'OWN',
    period: 'Aug 2024 – Feb 2025',
    stack: ['AWS Lambda', 'EventBridge', 'AWS Health API', 'Datadog', 'Python'],
    summary:
      "Built OWN's first end-to-end cloud pipeline — EventBridge → Lambda → Datadog — giving the on-call team proactive visibility into AWS-scheduled EC2 reboots.",
    problem:
      'EC2 instances rebooted for AWS-scheduled maintenance with no team visibility into when or why. Surprise reboots caused outages with no warning, making incident response entirely reactive.',
    constraints:
      'Sole builder of the pipeline, with limited prior Lambda/EventBridge experience, working across two tooling ecosystems (AWS and Datadog).',
    approach: [
      'Configured EventBridge to capture EC2 reboot/retirement events from the AWS Health API.',
      'Wrote a Lambda triggered by those events to forward structured data to Datadog as a log event.',
      'Created a Datadog Monitor to detect those events and alert the on-call team.',
    ],
    architecture: `AWS Health (EC2 maintenance events)
  └─ EventBridge rule (reboot / retirement)
     └─ Lambda function
        └─ Datadog Logs API (custom event)
           └─ Datadog monitor
              └─ alert → on-call notification`,
    outcome:
      'The team gained proactive visibility into maintenance windows — engineers could drain or prep instances ahead of reboots instead of reacting to surprise downtime — and it established a reusable observability pattern for other AWS event types.',
    reflection:
      'My first end-to-end cloud pipeline. Understanding how three separate services hand data off to each other was a real systems-thinking challenge, and debugging the Lambda → Datadog log structure so the monitor actually fired taught me to test the full chain, not just the pieces.',
  },
  {
    id: 'cron-email-reputation',
    title: 'Cron Cleanup & Email Reputation Protection',
    org: 'OWN',
    period: 'Aug 2024 – Feb 2025',
    stack: ['Ansible', 'Linux', 'Cron'],
    summary:
      "Audited and standardized mail-host cron jobs with Ansible to kill spam-generating processes and protect OWN's email sender reputation — production-safe work as a first-semester intern.",
    problem:
      "Misconfigured and legacy cron jobs on OWN's mail infrastructure were generating spam-like behavior, threatening the company's email sender reputation — the metric that governs deliverability and domain trust. Unchecked, ISPs could flag or block outbound mail entirely.",
    constraints:
      'First engineering internship and first hands-on exposure to Ansible and Linux cron, in a production environment where every change carried real business risk.',
    approach: [
      'Audited cron jobs across the mail fleet to identify problematic and legacy entries.',
      'Standardized cron configuration across hosts with Ansible playbooks.',
      'Removed the offending jobs causing spam behavior.',
      'Made every change idempotent so the fixes survive future deployments.',
    ],
    architecture: `Linux hosts
  └─ cron daemon
     └─ [legacy / spam jobs] ── identified & removed
        └─ Ansible playbooks (managed via inventory)
           └─ standardized, safe job schedule`,
    outcome:
      "Reduced the risk of domain blacklisting and preserved OWN's sender-reputation score and deliverability for customer-facing mail — production-safe remediation delivered as a first-semester intern.",
    reflection:
      'My first taste of infrastructure and config management. Ansible felt intimidating but the declarative model clicked fast — you describe what you want, not how to get there. It taught me that infra bugs aren’t always code bugs; sometimes it’s just legacy entropy nobody cleaned up.',
  },
  {
    id: 'careerspring-interest-finder',
    title: 'CareerSpring Interest Finder',
    org: 'CareerSpring',
    period: 'Summer 2023',
    stack: ['WordPress', 'PHP', 'JavaScript', 'HTML', 'CSS'],
    summary:
      'Built a custom career-interest profiler on WordPress — design through deploy — that routes first-gen users toward careers aligned with their answers.',
    problem:
      "CareerSpring serves first-generation students who often arrive without a clear sense of what careers even exist for their interests. Their site needed a lightweight, self-serve tool that could turn a short set of interest signals into a real career direction — not another static resource page.",
    constraints:
      'Developer intern on a small team — sole owner of the feature from wireframe to deploy. WordPress was the required platform (rest of the site lived on it), and the interaction had to survive a wide range of devices and reading levels.',
    approach: [
      'Wireframed the interest-to-career flow with the team and translated it into a step-by-step profiler.',
      'Built the profiler as a custom WordPress component — form logic, question weighting, and result routing wired into the CMS so non-engineers could update questions later.',
      'Wrote the front-end in plain JavaScript + CSS to keep the surface small and load fast on low-end devices in a school-computer context.',
      'Tested against the existing CareerSpring pages and got the tool live in the summer window.',
    ],
    architecture: `user starts profiler
  └─ WordPress page (custom template)
     └─ question set (interest signals)
        └─ JS scoring ── maps answers → career families
           └─ result view ── links into CareerSpring's career library`,
    outcome:
      'A live, self-serve career-interest tool inside the CareerSpring site — students get an actionable direction from a short set of answers instead of a wall of static content, and the profiler itself is CMS-editable so the team can iterate on questions without a developer.',
    reflection:
      'My first internship shipping to a real audience. The hardest part wasn\'t the code — it was building something for a user I wasn\'t. Sitting with what a first-gen student actually needs from a career tool changed the design more than any technical decision, and set the pattern for how I approach product work now.',
  },
  {
    id: 'blacksite',
    title: 'BLACKSITE — Browser Game Arcade',
    org: 'Personal',
    period: 'Ongoing',
    stack: ['React', 'Canvas', 'Game Loop', 'JavaScript', 'UX'],
    summary:
      'An immersive "secure terminal" that opens into an arcade — two playable browser games I built from scratch in React and canvas, wrapped in the site’s root@wound.os fiction.',
    problem:
      "I wanted the portfolio to *show* front-end skill, not just describe it — something a visitor could actually play, woven into the site's terminal fiction rather than bolted on as a generic demo.",
    constraints:
      'Built solo and in-repo, with no game engine — just React, the canvas API, and requestAnimationFrame. It had to run smoothly in the browser, match the site aesthetic, and stay maintainable alongside everything else.',
    approach: [
      'Designed a multi-stage "secure access" flow — a typing terminal that authenticates the visitor (CLEARANCE LEVEL 5) into a BLACKSITE program grid.',
      'Built two complete games from scratch — DataSpike and NullEscape — each with its own game loop, input handling, state, collision, and canvas rendering.',
      'Wrapped it all in a draggable terminal-window UI (minimize / maximize / close) with a glitch aesthetic that ties into the rest of the site.',
      'Left "classified" programs locked as forward hooks for future games.',
    ],
    architecture: `/programs  (access terminal)
  └─ typed access sequence → CLEARANCE LEVEL 5
     └─ /programs/blacksite  (program grid)
        ├─ DataSpike   ── canvas game loop
        ├─ NullEscape  ── canvas game loop
        └─ [classified] ── locked (future games)`,
    outcome:
      'A fully playable arcade living inside the portfolio — proof of interactive front-end and game-loop engineering, not just a description of it. Two complete games, an immersive access narrative, and room to keep adding.',
    reflection:
      "This is the piece that backs up the line about writing code that's entirely my own. Game loops force you to think about timing, state, and rendering every single frame — a completely different muscle from infrastructure work, and the most fun I've had building for the browser.",
    launch: { to: '/programs', label: '▶ access the arcade' },
  },
];

export const findCaseStudy = (id) => caseStudies.find((c) => c.id === id) || null;

// Shape a case study as a Coverflow "log card" — an image-less terminal face
// the carousel renders inline among the visual works.
export const toLogCard = (id) => {
  const c = findCaseStudy(id);
  if (!c) return null;
  return {
    key: `log-${c.id}`,
    kind: 'log',
    to: `/engineering/${c.id}`,
    title: c.title,
    org: c.org,
    summary: c.summary,
    stack: c.stack,
  };
};

// Education — schooling and the projects built there. Each project links to its
// existing Cache piece (cacheId) rather than a separate write-up.
export const schools = [
  {
    name: 'Marcy Lab School',
    focus: 'Software Development',
    period: '2022 – 2023',
    anchor: 'edu-marcy',
    projects: [
      {
        id: 'second-wind',
        title: 'Second Wind',
        type: 'Full-stack platform',
        year: '2023',
        cacheId: 58,
        summary:
          'A full-stack community platform providing resources, support, and employment for people impacted by the justice system — built as project manager and backend engineer.',
        stack: ['Node', 'Express', 'PostgreSQL', 'Knex', 'SQL'],
      },
      {
        id: 'metvoyager',
        title: 'METVoyager',
        type: 'Web app',
        year: '2023',
        cacheId: 60,
        summary:
          'A web app on the MET API that recommends artworks by search or category and lets users save favorites to a personal gallery.',
        stack: ['JavaScript', 'MET API', 'HTML', 'CSS'],
      },
    ],
  },
  {
    name: 'Parsons School of Design',
    focus: 'Design & Technology',
    period: '2020 – 2022',
    anchor: 'edu-parsons',
    projects: [
      {
        id: 'sap-forthesoul',
        title: 'SAP (FORTHESOUL)',
        type: 'Interactive sculpture',
        year: '2022',
        cacheId: 3,
        summary:
          'An AutoCAD-modeled sculpture with Arduino + a PIR motion sensor that speaks an existential narrative drawn from Sartre, Camus, and my own words.',
        stack: ['Arduino', 'AutoCAD', 'PIR Sensor', 'Electronics'],
      },
      {
        id: 'motion-heat-cutter',
        title: 'Motion Heat Cutter / Gluttony',
        type: 'Interactive sculpture',
        year: '2021',
        cacheId: 101,
        summary:
          'A motion-activated nichrome cutter that burns foam to sculpt a critique of the transatlantic sugar trade and the exploitation of Black labor.',
        stack: ['Arduino', '3D Modeling', 'Electronics', 'Foam'],
      },
    ],
  },
];

// Career internships that aren't deep case studies — links to the Cache piece.
export const internships = [
  {
    id: 'careerspring-interest-finder',
    title: 'CareerSpring Interest Finder',
    type: 'Internship · Developer',
    year: '2023',
    cacheId: 59,
    summary:
      'A custom WordPress career-interest profiler — design, wireframing, and build — that guides people toward careers aligned with their interests.',
    stack: ['JavaScript', 'HTML', 'CSS', 'WordPress'],
  },
];

// Career "metro line" — the institutions and companies, in order. Each station
// scrolls to that place's projects in the sections below (anchor ids).
export const timeline = [
  { year: '2020', label: 'Parsons School of Design', sub: 'Education', to: '#edu-parsons', origin: true },
  { year: '2022', label: 'Marcy Lab School', sub: 'Education', to: '#edu-marcy' },
  { year: '2023', label: 'CareerSpring', sub: 'Internship', to: '#sec-internship' },
  { year: '2024', label: 'OWN', sub: 'Internship', to: '#sec-case-studies' },
  { year: '2025', label: 'Salesforce', sub: 'AMTS', to: '#sec-case-studies', current: true },
];

// Skills grouped by domain — its own section (cat /var/log/skills).
export const skills = [
  { group: 'Cloud & Infrastructure', items: ['AWS', 'GovCloud', 'Terraform', 'Ansible', 'Packer', 'Jenkins', 'ArgoCD', 'Lambda'] },
  { group: 'Security & Compliance', items: ['FedRAMP', 'CrowdStrike', 'Tenable', 'Nexus IQ'] },
  { group: 'Observability', items: ['Datadog', 'Splunk / SIEM'] },
  { group: 'Languages', items: ['Python', 'JavaScript', 'SQL', 'Bash'] },
  { group: 'Web & Frameworks', items: ['React', 'Node', 'Express', 'PostgreSQL', 'WordPress'] },
  { group: 'Tools & Platforms', items: ['Linux', 'Git', 'GitLab'] },
  { group: 'Creative Tech', items: ['Canvas', 'Arduino', 'AutoCAD', '3D Modeling'] },
];

export default caseStudies;

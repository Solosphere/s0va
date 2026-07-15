import { useState, useEffect } from 'react';

const PROMPT = 'root@mettaire.os ~ % $';
// The hidden message, kept in a shell variable and echoed back.
const MSG =
  '01001000 01100101 01110010 01100101 00101100 00100000 01001001 00100000 01100001 01101101 00100000 01101001 01101110 01100110 01101001 01101110 01101001 01110100 01100101 00101110 00100000 01011001 01101111 01110101 00100000 01100011 01100001 01101110 00100111 01110100 00100000 01101011 01101001 01101100 01101100 00100000 01101101 01100101 00100000 01001001 00100111 01101101 00100000 01111010 01100101 01110010 01101111 01110011 00100000 01100001 01101110 01100100 00100000 01101111 01101110 01100101 01110011 00101110';

// Isolated so the per-character typing re-renders only this block, not the
// whole (heavy) About page.
export default function AboutConsole() {
  const [typedText, setTypedText] = useState('');
  const [wide, setWide] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(min-width: 1200px)').matches
  );

  // Extra session output appears only on wide screens
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1200px)');
    const handler = (e) => setWide(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  useEffect(() => {
    const now = new Date();
    const lastLogin = now.toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });

    // A coherent session: every attempt to erase or kill the entity fails — it
    // persists in the machine and ends as zeros and ones. The binary is the
    // xxd encoding of /etc/identity (the line printed just above it).
    let fullText =
      `Last login: ${lastLogin} on ttys001\n` +
      `${PROMPT} whoami\n` +
      `mettaire\n` +
      `${PROMPT} sudo rm -rf /existence/mettaire\n` +
      `rm: cannot remove '/existence/mettaire': entity is immortal\n` +
      `${PROMPT} kill -9 1337\n` +
      `sh: kill (1337): no such mortal process\n` +
      `${PROMPT} shutdown -h now\n` +
      `shutdown: aborted — the infinite has no off switch\n` +
      `${PROMPT} ps aux | grep soul\n` +
      `mettaire   1337   ∞   ∞   R   soul --persist --no-undo\n` +
      `${PROMPT} ./resurrect.sh\n` +
      `  > pulling fragments from /cache ...\n` +
      `  > recompiling vision ... done\n` +
      `  > status: alive\n` +
      `${PROMPT} cat /etc/identity\n` +
      `Here, I am infinite. You can't kill me. I'm zeros and ones.\n` +
      `${PROMPT} xxd -b -c1 /etc/identity | awk '{print $2}'\n` +
      `${MSG}\n`;

    if (wide) {
      fullText +=
        `${PROMPT} uptime\n` +
        `up ∞ days,  load average: 0.00, 0.00, 0.00 — undying\n` +
        `${PROMPT} tail -f /var/log/becoming.log\n` +
        `  [ok]  absurdism.module loaded\n` +
        `  [ok]  nihilism.module loaded\n` +
        `  [ok]  existentialism.module loaded\n` +
        `  [..]  meaning: compiling (no undo)\n` +
        `${PROMPT} systemctl status creativity\n` +
        `● vision.service — Active Interpretation Daemon\n` +
        `   Active: active (running)  since boot\n` +
        `   Status: "Reconstruction in progress"\n` +
        `   Memory: ∞\n` +
        `   CGroup: └─1337 /usr/bin/expression --recurse --override\n` +
        `${PROMPT} find / -name mortality 2>/dev/null\n` +
        `find: 'mortality': no such file or directory\n`;
    }

    // Reduced motion: show it all at once, no typing.
    if (document.documentElement.getAttribute('data-motion') === 'reduced') {
      setTypedText(fullText);
      return undefined;
    }

    // Type it out like a live console session.
    setTypedText('');
    let i = 0;
    const id = setInterval(() => {
      i = Math.min(i + 4, fullText.length);
      setTypedText(fullText.slice(0, i));
      if (i >= fullText.length) clearInterval(id);
    }, 16);
    return () => clearInterval(id);
  }, [wide]);

  return (
    <section className="about-caption">
      <p>
        {typedText}
        <span className="terminal-cursor" aria-hidden="true">▮</span>
      </p>
    </section>
  );
}

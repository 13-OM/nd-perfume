import { motion } from 'framer-motion';

/** Section heading with eyebrow + title + subtitle */
export default function SectionHeading({ eyebrow, title, subtitle, center = true }) {
  return (
    <div className={`sec-head ${center ? '' : 'left'}`}>
      {eyebrow && <span className="eyebrow">{eyebrow}</span>}
      <motion.h2
        className="h2"
        initial={{ opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      >
        {title}
      </motion.h2>
      {subtitle && <p className="muted" style={{ maxWidth: 600 }}>{subtitle}</p>}
    </div>
  );
}

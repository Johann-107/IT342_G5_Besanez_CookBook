import styles from '../../styles/Footer.module.css';

const FOOTER_LINKS = [
    { id: 'about', label: 'About' },
    { id: 'contact', label: 'Contact' },
    { id: 'privacy', label: 'Privacy' },
    { id: 'terms', label: 'Terms' },
];

const Footer = ({ onLinkClick }) => {
    const handleClick = (id) => {
        if (onLinkClick) onLinkClick(id);
    };

    return (
        <footer className={styles.footer}>
            {FOOTER_LINKS.map((link) => (
                <span
                    key={link.id}
                    className={styles.footerLink}
                    onClick={() => handleClick(link.id)}
                >
                    {link.label}
                </span>
            ))}
            <span className={styles.copyright}>© 2025 CookBook</span>
        </footer>
    );
};

export default Footer;
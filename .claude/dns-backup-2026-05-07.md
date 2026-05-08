# Backup DNS dedicaresolutions.it
**Data:** 2026-05-07
**Motivo:** Pre "Passare a Dominio" su Aruba (DNS reset previsto)

---

## 🔴 CRITICI — Microsoft 365 Mail (DEVONO essere ripristinati)

| Tipo | Nome | Valore | TTL |
|---|---|---|---|
| MX | `@` | `dedicaresolutions-it.mail.protection.outlook.com` (priorità 0) | 3600 |
| TXT | `@` | `v=spf1 include:spf.protection.outlook.com -all` | 3600 |
| CNAME | `autodiscover` | `autodiscover.outlook.com` | 3600 |
| TXT | `_dmarc` | `v=DMARC1; p=none; adkim=r; aspf=r` | 300 |

> Confermati anche su Microsoft 365 Admin Center → Domini → dedicaresolutions.it → Record DNS

## 🟢 SOSTITUIRE — Sito web (puntare a GitHub Pages)

| Tipo | Nome | VECCHIO valore (Aruba) | NUOVO valore (GitHub) |
|---|---|---|---|
| A | `@` (root) | `89.46.110.7` | `185.199.108.153` |
| A | `@` (root) | — | `185.199.109.153` |
| A | `@` (root) | — | `185.199.110.153` |
| A | `@` (root) | — | `185.199.111.153` |
| A | `www` | `89.46.110.7` | (rimuovi) |
| CNAME | `www` | — | `hunterprog-afk.github.io` |

## 🌐 Name Servers Aruba (rimangono)

- dns.technorail.com
- dns2.technorail.com
- dns3.arubadns.net
- dns4.arubadns.cz

---

## Sequenza ripristino DNS dopo "Passare a Dominio"

1. **PRIMA**: aggiungere/verificare i 4 record Microsoft 365 (mail funziona = priorità #1)
2. **POI**: aggiungere i 4 A record GitHub Pages
3. **POI**: aggiungere CNAME `www` → `hunterprog-afk.github.io`

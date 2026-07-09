# Süreklilik & Context Handoff

Context window dolduğunda veya yeni oturum açıldığında **önce bunları oku**:

1. `docs/SESSION_STATE.md` — şu an neredeyiz  
2. `docs/PROJECT_INDEX.md` — dosya haritası  
3. `ROADMAP.md` — faz planı  
4. `AGENTS.md` — kurallar  
5. `docs/PHASE_A_STATUS.md` / `docs/PHASE_B_STATUS.md` — tamamlanan işler  

## Yeni oturum prompt şablonu

```
Fenerbahçe Evreni. docs/SESSION_STATE.md ve docs/PROJECT_INDEX.md oku.
Sıradaki adım: [ör. Faz B FBref fix / FotMob match sync].
Tek adım yap, raporla.
```

## Güncelleme kuralı (agent)

Her anlamlı adım bitince `docs/SESSION_STATE.md` güncelle:
- Son tamamlanan adım
- Sonraki adım
- Bilinen blocker
- Son başarılı job komutları

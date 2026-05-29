# Gallery Images

Add your own project and machinery photos here. Use **JPG** or **PNG**, recommended size **1200×900** (4:3).

## Folder structure

```
gallery/
  projects/     ← completed installations (site photos)
  machinery/    ← equipment, machines, close-ups
```

## Replace demo images

1. Save your photo with the **same filename** as an existing file (e.g. `projects/ro-plant.jpg`), or  
2. Add a new file and register it in `src/data/gallery.ts` (`image` path + titles).

## Example entry in `gallery.ts`

```ts
{
  id: "my-project-1",
  type: "project",
  image: "/images/gallery/projects/my-project-1.jpg",
  title: { en: "ETP Plant – Kanpur", hi: "ईटीपी संयंत्र – कानपुर" },
  description: { en: "500 KLD effluent treatment commissioned in 2025.", hi: "..." },
}
```

After adding files, run `npm run dev` and open **Gallery** in the site menu.

-- Generalize detail sections so each entry can hold ANY kind of detail, not just
-- URLs. Rename `links` -> `items` and each entry's `url` -> `value`. A value that
-- happens to be a URL is rendered as a link by the UI; anything else is shown as text.
UPDATE "Project"
SET "detailSections" = (
  SELECT COALESCE(jsonb_agg(
    jsonb_build_object(
      'heading', COALESCE(s->>'heading', ''),
      'items', COALESCE((
        SELECT jsonb_agg(
          jsonb_build_object(
            'label', COALESCE(i->>'label', ''),
            'value', COALESCE(i->>'value', i->>'url', '')
          )
        )
        FROM jsonb_array_elements(COALESCE(s->'items', s->'links', '[]'::jsonb)) AS i
      ), '[]'::jsonb)
    )
  ), '[]'::jsonb)
  FROM jsonb_array_elements("detailSections") AS s
)
WHERE jsonb_typeof("detailSections") = 'array'
  AND jsonb_array_length("detailSections") > 0;

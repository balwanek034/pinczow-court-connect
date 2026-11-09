CREATE SEQUENCE public.zapytania_numer_seq;
GRANT USAGE, SELECT ON SEQUENCE public.zapytania_numer_seq TO service_role;

CREATE TABLE public.zapytania (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  numer text NOT NULL UNIQUE DEFAULT ('KO-' || to_char(now(), 'YYYY') || '-' || lpad(nextval('public.zapytania_numer_seq')::text, 5, '0')),
  kod_hash text NOT NULL,
  imie_nazwisko text NOT NULL,
  kontakt text NOT NULL DEFAULT '',
  kategoria text NOT NULL,
  wydzial text NOT NULL DEFAULT '',
  sygnatura text NOT NULL DEFAULT '',
  temat text NOT NULL,
  status text NOT NULL DEFAULT 'nowe' CHECK (status IN ('nowe', 'w_toku', 'zamkniete')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, UPDATE ON public.zapytania TO authenticated;
GRANT ALL ON public.zapytania TO service_role;
ALTER TABLE public.zapytania ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff read inquiries" ON public.zapytania FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'pracownik') OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Staff update inquiries" ON public.zapytania FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'pracownik') OR public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'pracownik') OR public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.zapytania_wiadomosci (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  zapytanie_id uuid NOT NULL REFERENCES public.zapytania(id) ON DELETE CASCADE,
  autor text NOT NULL CHECK (autor IN ('obywatel', 'sad')),
  autor_nazwa text NOT NULL DEFAULT '',
  autor_id uuid,
  tresc text NOT NULL CHECK (char_length(tresc) BETWEEN 1 AND 5000),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX zapytania_wiadomosci_zapytanie_idx ON public.zapytania_wiadomosci (zapytanie_id, created_at);
GRANT SELECT, INSERT ON public.zapytania_wiadomosci TO authenticated;
GRANT ALL ON public.zapytania_wiadomosci TO service_role;
ALTER TABLE public.zapytania_wiadomosci ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff read messages" ON public.zapytania_wiadomosci FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'pracownik') OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Staff reply as court" ON public.zapytania_wiadomosci FOR INSERT TO authenticated
  WITH CHECK (
    autor = 'sad' AND autor_id = auth.uid()
    AND (public.has_role(auth.uid(), 'pracownik') OR public.has_role(auth.uid(), 'admin'))
  );

CREATE TABLE public.sedziowie (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  imie_nazwisko text NOT NULL CHECK (char_length(imie_nazwisko) BETWEEN 2 AND 120),
  rodzaj text NOT NULL CHECK (rodzaj IN ('sedzia', 'asesor')),
  funkcja text NOT NULL DEFAULT '',
  wydzial text NOT NULL DEFAULT '',
  kolejnosc integer NOT NULL DEFAULT 100,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.sedziowie TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.sedziowie TO authenticated;
GRANT ALL ON public.sedziowie TO service_role;
ALTER TABLE public.sedziowie ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Judges list is public" ON public.sedziowie FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins add judges" ON public.sedziowie FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins edit judges" ON public.sedziowie FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins remove judges" ON public.sedziowie FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
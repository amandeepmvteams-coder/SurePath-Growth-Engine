INSERT INTO industries (name)
VALUES
    ('Fashion'),
    ('Apparel'),
    ('Home & Furniture'),
    ('Beauty & Skincare'),
    ('Pets'),
    ('Health & Supplements'),
    ('Electronics'),
    ('Food & Beverage'),
    ('Other')
ON CONFLICT (name) DO NOTHING;
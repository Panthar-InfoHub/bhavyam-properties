-- Insert a sample property in Mumbai
WITH new_property AS (
  INSERT INTO public.properties (
    owner_id, 
    listing_type, 
    property_type, 
    pricing_type, 
    price, 
    city, 
    area, 
    address, 
    status, 
    map_url, 
    description
  ) VALUES (
    '94bb23e2-613c-437f-8229-52b9edfbb231',
    'sale',
    '3 BHK Luxury Apartment',
    'fixed',
    25000000, -- 2.5 Cr
    'Mumbai',
    'Worli',
    'Worli Sea Face, Mumbai, Maharashtra 400030',
    'approved',
    'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3772.333333333333!2d72.81!3d19.0!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3be7ce123456789%3A0x1234567890abcdef!2sWorli%20Sea%20Face!5e0!3m2!1sen!2sin!4v1234567890123',
    'A stunning 3 BHK penthouse with an uninterrupted view of the Arabian Sea. Modern amenities including a private pool and automated home systems.'
  )
  RETURNING id
)
INSERT INTO public.property_media (property_id, url, media_type)
SELECT id, 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80', 'image' FROM new_property
UNION ALL
SELECT id, 'https://images.unsplash.com/photo-1600585154340-be6199f7d009?auto=format&fit=crop&w=1200&q=80', 'image' FROM new_property
UNION ALL
SELECT id, 'https://www.w3schools.com/html/mov_bbb.mp4', 'video' FROM new_property;

-- Insert another sample property in Pune
WITH new_property_2 AS (
  INSERT INTO public.properties (
    owner_id, 
    listing_type, 
    property_type, 
    pricing_type, 
    price, 
    city, 
    area, 
    address, 
    status, 
    map_url, 
    description
  ) VALUES (
    '94bb23e2-613c-437f-8229-52b9edfbb231',
    'rent',
    '4 BHK Independent Villa',
    'negotiable',
    85000, -- 85k Rent
    'Pune',
    'Koregaon Park',
    'Lane 7, Koregaon Park, Pune, Maharashtra 411001',
    'approved',
    'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3782.3!2d73.89!3d18.53!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bc2c123456789%3A0x1234567890abcde!2sKoregaon%20Park!5e0!3m2!1sen!2sin!4v1234567890124',
    'Spacious 4 BHK villa in the heart of Koregaon Park. Features a private garden, 24/7 security, and ultra-modern interiors. Perfect for high-profile tenants.'
  )
  RETURNING id
)
INSERT INTO public.property_media (property_id, url, media_type)
SELECT id, 'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=1200&q=80', 'image' FROM new_property_2
UNION ALL
SELECT id, 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1200&q=80', 'image' FROM new_property_2
UNION ALL
SELECT id, 'https://www.w3schools.com/html/movie.mp4', 'video' FROM new_property_2;

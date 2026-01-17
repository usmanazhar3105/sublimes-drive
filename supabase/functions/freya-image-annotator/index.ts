// Freya Image Annotator - Add visual annotations to images
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Annotation {
  x: number;
  y: number;
  label: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { image_url, annotations, post_id } = await req.json();

    if (!image_url || !annotations || !Array.isArray(annotations)) {
      throw new Error('Invalid input: image_url and annotations[] required');
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Check if image annotation is enabled
    const { data: settings } = await supabase
      .from('freya_settings')
      .select('image_annotation_enabled')
      .limit(1)
      .single();

    if (!settings?.image_annotation_enabled) {
      return new Response(JSON.stringify({ 
        skipped: true, 
        reason: 'Image annotation disabled' 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Fetch the original image
    const imageResponse = await fetch(image_url);
    if (!imageResponse.ok) {
      throw new Error('Failed to fetch image');
    }

    const imageBuffer = await imageResponse.arrayBuffer();

    // Create SVG overlay (simple implementation)
    // In production, use Sharp or similar for proper image processing
    const svgOverlay = createSVGOverlay(annotations);
    
    // Generate unique filename
    const timestamp = Date.now();
    const filename = `annotated_${post_id}_${timestamp}.svg`;
    const storagePath = `${post_id}/${filename}`;

    // Upload to freya-attachments bucket
    const { error: uploadError } = await supabase
      .storage
      .from('freya-attachments')
      .upload(storagePath, new Blob([svgOverlay], { type: 'image/svg+xml' }), {
        contentType: 'image/svg+xml',
        upsert: false
      });

    if (uploadError) {
      throw new Error(`Upload failed: ${uploadError.message}`);
    }

    // Create signed URL (7 days)
    const { data: signedUrl } = await supabase
      .storage
      .from('freya-attachments')
      .createSignedUrl(storagePath, 604800); // 7 days

    // Save to freya_image_assets
    const { data: asset } = await supabase
      .from('freya_image_assets')
      .insert({
        post_id,
        storage_path: storagePath,
        description: `Annotated with ${annotations.length} markers`
      })
      .select('id')
      .single();

    return new Response(JSON.stringify({
      success: true,
      asset_id: asset.id,
      signed_url: signedUrl?.signedUrl,
      annotations_count: annotations.length
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error: any) {
    console.error('Image annotator error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

function createSVGOverlay(annotations: Annotation[]): string {
  const width = 800;
  const height = 600;
  
  let markers = '';
  let legend = '';
  
  annotations.forEach((ann, idx) => {
    const num = idx + 1;
    // Pin marker
    markers += `
      <circle cx="${ann.x}" cy="${ann.y}" r="15" fill="red" opacity="0.7"/>
      <text x="${ann.x}" y="${ann.y + 5}" text-anchor="middle" fill="white" font-size="16" font-weight="bold">${num}</text>
    `;
    // Legend
    legend += `
      <text x="10" y="${20 + idx * 20}" fill="white" font-size="14">${num}. ${ann.label}</text>
    `;
  });

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" fill="rgba(0,0,0,0.1)"/>
  ${markers}
  <rect x="0" y="0" width="300" height="${annotations.length * 20 + 30}" fill="rgba(0,0,0,0.7)"/>
  <text x="10" y="20" fill="white" font-size="16" font-weight="bold">Annotations:</text>
  ${legend}
</svg>`;
}


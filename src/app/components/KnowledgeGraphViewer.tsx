import React from 'react';
import { Box, Typography, Chip, Stack } from '@mui/material';
import ForceGraph2D from 'react-force-graph-2d';
import { knowledgeGraph } from '../utils/malagasyDictionary';

export function KnowledgeGraphViewer() {
  // Préparer les données pour le graphe
  const graphData = {
    nodes: knowledgeGraph.nodes.map(node => ({
      id: node.id,
      name: node.label,
      val: 10,
      color: 
        node.category === 'verb' ? '#1976d2' :
        node.category === 'noun' ? '#388e3c' :
        node.category === 'adjective' ? '#f57c00' :
        node.category === 'city' ? '#d32f2f' :
        '#757575'
    })),
    links: knowledgeGraph.links.map(link => ({
      source: link.source,
      target: link.target,
      label: link.relation,
      color: '#999'
    }))
  };

  return (
    <Box sx={{ width: '100%', height: 600 }}>
      <Stack spacing={2} sx={{ mb: 2 }}>
        <Typography variant="body1">
          Ce graphe montre les relations sémantiques entre les mots malgaches.
          Chaque couleur représente une catégorie grammaticale différente.
        </Typography>
        
        <Stack direction="row" spacing={1} flexWrap="wrap">
          <Chip label="Verbes" sx={{ bgcolor: '#1976d2', color: 'white' }} size="small" />
          <Chip label="Noms" sx={{ bgcolor: '#388e3c', color: 'white' }} size="small" />
          <Chip label="Adjectifs" sx={{ bgcolor: '#f57c00', color: 'white' }} size="small" />
          <Chip label="Villes" sx={{ bgcolor: '#d32f2f', color: 'white' }} size="small" />
        </Stack>
      </Stack>

      <Box sx={{ 
        border: '1px solid #ccc', 
        borderRadius: 1,
        bgcolor: '#fafafa',
        height: 500
      }}>
        <ForceGraph2D
          graphData={graphData}
          nodeLabel="name"
          nodeAutoColorBy="category"
          linkLabel="label"
          linkDirectionalArrowLength={3}
          linkDirectionalArrowRelPos={1}
          linkCurvature={0.2}
          nodeCanvasObject={(node: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
            const label = node.name;
            const fontSize = 12/globalScale;
            ctx.font = `${fontSize}px Sans-Serif`;
            const textWidth = ctx.measureText(label).width;
            const bckgDimensions = [textWidth, fontSize].map(n => n + fontSize * 0.2);

            // Dessiner le cercle du nœud
            ctx.beginPath();
            ctx.arc(node.x, node.y, 5, 0, 2 * Math.PI, false);
            ctx.fillStyle = node.color || '#999';
            ctx.fill();

            // Dessiner le texte
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = '#333';
            ctx.fillText(label, node.x, node.y + 10);
          }}
          enableNodeDrag={true}
          enableZoomPanInteraction={true}
          cooldownTicks={100}
          onEngineStop={() => {}}
        />
      </Box>

      <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
        Vous pouvez zoomer, déplacer et réorganiser les nœuds pour mieux visualiser les relations.
      </Typography>
    </Box>
  );
}

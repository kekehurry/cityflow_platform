import * as d3 from 'd3';
import React, { useEffect, useRef, useState } from 'react';
import Loading from '@/components/Loading';

const createForceGraph2D = ({
  containerId,
  graphData,
  nodeStrokeColor,
  nodeFillColorMap,
  linkWidth,
  nodeLabel,
  linkColor,
  nodeAutoColorBy,
  setSelectedNode,
}) => {
  const container = document.querySelector(containerId);
  const width = container.clientWidth;
  const height = container.clientHeight;

  let isPanning = false;
  let startX, startY, dx, dy;
  let zoomFactor = 1;

  let svg = d3.select(containerId).select('svg');

  if (svg.empty()) {
    svg = d3
      .select(containerId)
      .append('svg')
      .attr('class', 'graph-container')
      .attr('width', '100%')
      .attr('height', '100%')
      .on('mousedown', panstarted)
      .on('mousemove', panned)
      .on('mouseup', panended)
      .call(d3.zoom().scaleExtent([0.1, 10]).on('zoom', zoomed));
  } else {
    svg.selectAll('*').remove();
  }

  const simulation = d3
    .forceSimulation(graphData.nodes)
    .force(
      'link',
      d3
        .forceLink(graphData.links)
        .id((d) => d.id)
        .distance(100)
    )
    .force('charge', d3.forceManyBody().strength(15))
    .force('center', d3.forceCenter(width / 2, height / 2))
    .force(
      'collision',
      d3.forceCollide().radius((d) => Math.log(d.value + 1) * 25)
    );

  const link = svg
    .append('g')
    .attr('class', 'links')
    .selectAll('line')
    .data(graphData.links)
    .enter()
    .append('line')
    .attr('stroke-width', (l) =>
      l.type == 'forked_from' ? linkWidth * 10 : linkWidth
    )
    .attr('stroke', linkColor);

  const node = svg
    .append('g')
    .attr('class', 'nodes')
    .selectAll('circle')
    .data(graphData.nodes)
    .enter()
    .append('circle')
    .attr('r', (d) => Math.log(d.value + 1) * 15)
    .attr('fill', (d) => nodeFillColorMap[d[nodeAutoColorBy]])
    .attr('stroke', (d) => nodeStrokeColor)
    .attr('stroke-width', 1)
    .call(
      d3
        .drag()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended)
    )
    .on('click', handleNodeClick)
    .on('mouseover', handleMouseOver)
    .on('mouseout', handleMouseOut);

  const label = svg
    .append('g')
    .attr('class', 'node-labels')
    .selectAll('text')
    .data(graphData.nodes)
    .enter()
    .append('text')
    .text((d) => JSON.parse(d[nodeLabel]))
    .attr('dx', (d) => JSON.parse(d[nodeLabel]).length * -2.5)
    .attr('dy', '.35em')
    .attr('font-size', 10)
    .attr('fill', 'white')
    .call(
      d3
        .drag()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended)
    )
    .on('click', handleNodeClick)
    .on('mouseover', function (event, d) {
      // Find and trigger mouseover on corresponding node
      svg
        .selectAll('circle')
        .filter((node) => node.id === d.id)
        .dispatch('mouseover');
    })
    .on('mouseout', function (event, d) {
      // Find and trigger mouseout on corresponding node
      svg
        .selectAll('circle')
        .filter((node) => node.id === d.id)
        .dispatch('mouseout');
    });

  simulation.on('tick', () => {
    link
      .attr('x1', (d) => d.source.x)
      .attr('y1', (d) => d.source.y)
      .attr('x2', (d) => d.target.x)
      .attr('y2', (d) => d.target.y);

    node.attr('cx', (d) => d.x).attr('cy', (d) => d.y);
    label.attr('x', (d) => d.x).attr('y', (d) => d.y);
  });

  function panstarted(event) {
    if (event.button === 1) {
      // Middle mouse button
      isPanning = true;
      startX = event.clientX;
      startY = event.clientY;
    }
  }

  function panned(event) {
    if (isPanning) {
      dx = event.clientX - startX;
      dy = event.clientY - startY;
      svg.attr('transform', `translate(${dx}, ${dy}) scale(${zoomFactor})`);
    }
  }

  function panended(event) {
    if (event.button === 1) {
      // Middle mouse button
      isPanning = false;
    }
  }

  function zoomed(event) {
    // Apply transform from center
    const transform = event.transform;
    zoomFactor = transform.k;
    svg.attr(
      'transform',
      `translate(${dx || 0}, ${dy || 0}) scale(${zoomFactor})`
    );
  }

  function dragstarted(event, d) {
    if (!event.active) simulation.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
  }

  function dragged(event, d) {
    d.fx = event.x;
    d.fy = event.y;
  }

  function dragended(event, d) {
    if (!event.active) simulation.alphaTarget(0);
    d.fx = null;
    d.fy = null;
  }

  function handleMouseOver(event, d) {
    d3.select(this).attr('stroke-width', 3);
  }

  function handleMouseOut(event, d) {
    d.selected || d3.select(this).attr('stroke-width', 1);
  }

  function handleNodeClick(event, d) {
    setSelectedNode(JSON.parse(d.nodeId));
    if (d.selected) {
      const nodeType = d.type;
      switch (nodeType) {
        case 'Module':
          typeof window !== 'undefined' &&
            window.open(`/flow?module=${JSON.parse(d.nodeId)}`, '_blank');
          break;
        case 'Workflow':
          typeof window !== 'undefined' &&
            window.open(`/flow?id=${JSON.parse(d.nodeId)}`, '_blank');
          break;
        case 'Author':
          typeof window !== 'undefined' &&
            window.open(`/author?id=${JSON.parse(d.nodeId)}`, '_blank');
          break;
        default:
          break;
      }
    }
  }
};

const ForceGraph2D = ({
  isLoading,
  graphData,
  nodeStrokeColor,
  nodeHighlightColor,
  nodeFillColorMap,
  linkWidth,
  nodeLabel,
  linkColor,
  nodeAutoColorBy,
  selectedNode,
  setSelectedNode,
}) => {
  const containerRef = useRef(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const [containerHeight, setContainerHeight] = useState(0);

  useEffect(() => {
    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        setContainerWidth(entry.contentRect.width);
        setContainerHeight(entry.contentRect.height);
      }
    });

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      if (containerRef.current) {
        resizeObserver.unobserve(containerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    graphData &&
      createForceGraph2D({
        containerId: '#force-graph',
        graphData,
        nodeStrokeColor,
        nodeHighlightColor,
        nodeFillColorMap,
        linkWidth,
        nodeLabel,
        linkColor,
        nodeAutoColorBy,
        selectedNode,
        setSelectedNode,
      });
  }, [graphData, containerWidth, containerHeight]);

  useEffect(() => {
    selectedNode &&
      d3
        .select('#force-graph')
        .selectAll('circle')
        .attr('stroke', (d) =>
          JSON.parse(d.nodeId) == selectedNode
            ? nodeHighlightColor
            : nodeStrokeColor
        )
        .attr('stroke-width', (d) => {
          d.selected = JSON.parse(d.nodeId) == selectedNode;
          return JSON.parse(d.nodeId) == selectedNode ? 5 : 1;
        });
  }, [selectedNode]);

  if (!graphData) {
    console.log('No graph data');
    return (
      <div ref={containerRef}>
        <Loading />
        {/* <img
          src="/static/fetching_large.gif"
          style={{ width: '100%', height: '100%' }}
        /> */}
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      id="force-graph"
      style={{ width: '100%', height: '100%' }}
    />
  );
};

export default ForceGraph2D;

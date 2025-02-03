import theme from '@/theme';
import { useCallback, useEffect, useRef } from 'react';
import { useReactFlow } from 'reactflow';

const InfiniteGrid = () => {
  const canvasRef = useRef();
  const { getZoom } = useReactFlow();
  const lastZoomRef = useRef(1);
  const animationFrameRef = useRef();

  const drawGrid = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { width, height } = canvas.getBoundingClientRect();
    const zoom = getZoom();

    // 立即取消之前的动画帧以确保及时更新
    cancelAnimationFrame(animationFrameRef.current);

    // 更新缩放引用
    lastZoomRef.current = zoom;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    ctx.clearRect(0, 0, width, height);

    const gridColor = theme.palette.flow.grid;
    const baseSpacing = 10;
    const minSpacing = 2;

    // 关键修正：使用除法替代乘法
    let effectiveSpacing = baseSpacing / zoom;
    let alpha = 1;

    // 调整间距和透明度以确保可见性
    while (effectiveSpacing < minSpacing) {
      effectiveSpacing *= 2;
      alpha *= 0.6;
    }

    // 绘制次网格线
    ctx.beginPath();
    ctx.strokeStyle = `${gridColor}${Math.round(alpha * 80)
      .toString(16)
      .padStart(2, '0')}`;
    ctx.lineWidth = 0.5;

    // 优化绘制逻辑
    const horizontalLines = Math.ceil(height / effectiveSpacing);
    const verticalLines = Math.ceil(width / effectiveSpacing);

    for (let i = 0; i <= horizontalLines; i++) {
      const y = i * effectiveSpacing;
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
    }

    for (let i = 0; i <= verticalLines; i++) {
      const x = i * effectiveSpacing;
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
    }

    ctx.stroke();

    // 绘制主网格线（每10个次网格线）
    const mainSpacing = effectiveSpacing * 10;
    const mainAlpha = Math.round(alpha * 20);

    if (mainSpacing <= Math.max(width, height)) {
      ctx.beginPath();
      ctx.strokeStyle = `${gridColor}${mainAlpha
        .toString(16)
        .padStart(2, '0')}`;
      ctx.lineWidth = 1;

      const mainHorizontalLines = Math.ceil(height / mainSpacing);
      const mainVerticalLines = Math.ceil(width / mainSpacing);

      for (let i = 0; i <= mainHorizontalLines; i++) {
        const y = i * mainSpacing;
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
      }

      for (let i = 0; i <= mainVerticalLines; i++) {
        const x = i * mainSpacing;
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
      }

      ctx.stroke();
    }

    // 使用动画帧持续监听
    animationFrameRef.current = requestAnimationFrame(drawGrid);
  }, [getZoom]);

  useEffect(() => {
    const resizeObserver = new ResizeObserver(() => {
      canvasRef.current && drawGrid();
    });

    if (canvasRef.current) {
      resizeObserver.observe(canvasRef.current);
      drawGrid();
    }

    return () => {
      resizeObserver.disconnect();
      cancelAnimationFrame(animationFrameRef.current);
    };
  }, [drawGrid]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        backgroundColor: theme.palette.flow.background,
      }}
    />
  );
};

export default InfiniteGrid;

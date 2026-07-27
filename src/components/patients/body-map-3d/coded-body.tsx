"use client";

import { useMemo } from "react";
import type { ThreeEvent } from "@react-three/fiber";
import * as THREE from "three";

import {
  deriveBodyMetrics,
  type BodyModelType,
  type DerivedBodyMetrics,
} from "@/lib/body-map-3d/proportions";

/** Tom de pele clínico (manequim anatômico, não cinza metálico). */
const SKIN = {
  color: "#d4b8a0",
  roughness: 0.55,
  metalness: 0.02,
} as const;

type ClickHandler = (point: THREE.Vector3, partName: string) => void;

type CodedBodyProps = {
  type: BodyModelType;
  onPartClick?: ClickHandler;
};

function getClickProps(name: string, onPartClick?: ClickHandler) {
  return {
    name,
    castShadow: true as const,
    receiveShadow: true as const,
    onClick: (event: ThreeEvent<MouseEvent>) => {
      event.stopPropagation();
      onPartClick?.(event.point.clone(), name);
    },
    onPointerOver: (event: ThreeEvent<PointerEvent>) => {
      event.stopPropagation();
      document.body.style.cursor = "crosshair";
    },
    onPointerOut: () => {
      document.body.style.cursor = "default";
    },
  };
}

function SoftMaterial() {
  return (
    <meshStandardMaterial
      color={SKIN.color}
      roughness={SKIN.roughness}
      metalness={SKIN.metalness}
      flatShading={false}
    />
  );
}

/**
 * Segmento de membro como cápsula ao longo do eixo Y local,
 * posicionada entre dois pontos do mundo (com sobreposição nas articulações).
 */
function LimbSegment({
  name,
  from,
  to,
  radius,
  overlap = 0.12,
  onPartClick,
}: {
  name: string;
  from: THREE.Vector3;
  to: THREE.Vector3;
  radius: number;
  /** Fração extra de comprimento para fundir nas juntas (0–0.25). */
  overlap?: number;
  onPartClick?: ClickHandler;
}) {
  const { position, quaternion, height } = useMemo(() => {
    const direction = new THREE.Vector3().subVectors(to, from);
    const distance = direction.length();
    const mid = new THREE.Vector3().addVectors(from, to).multiplyScalar(0.5);
    const extended = Math.max(0.04, distance * (1 + overlap));
    const quat = new THREE.Quaternion().setFromUnitVectors(
      new THREE.Vector3(0, 1, 0),
      direction.clone().normalize()
    );
    return {
      position: mid.toArray() as [number, number, number],
      quaternion: quat,
      height: Math.max(0.02, extended - radius * 2),
    };
  }, [from, to, radius, overlap]);

  const click = getClickProps(name, onPartClick);

  return (
    <mesh {...click} position={position} quaternion={quaternion}>
      <capsuleGeometry args={[radius, height, 10, 20]} />
      <SoftMaterial />
    </mesh>
  );
}

function SoftSphere({
  name,
  position,
  radius,
  scale,
  onPartClick,
}: {
  name: string;
  position: [number, number, number];
  radius: number;
  scale?: [number, number, number];
  onPartClick?: ClickHandler;
}) {
  const click = getClickProps(name, onPartClick);
  return (
    <mesh {...click} position={position} scale={scale}>
      <sphereGeometry args={[radius, 32, 32]} />
      <SoftMaterial />
    </mesh>
  );
}

/** Perfil suave ombro → peito → cintura → quadril (lathe). */
function buildTorsoProfile(m: DerivedBodyMetrics): THREE.Vector2[] {
  const isChild = m.type === "child";
  const topY = m.shoulderY + m.H * 0.06;
  const bottomY = m.crotchY + m.H * 0.02;
  const h = topY - bottomY;

  const shoulderR = m.torsoWidthTop * 0.5;
  const chestR = shoulderR * (isChild ? 0.9 : 0.93);
  const waistR = shoulderR * (isChild ? 0.72 : 0.62);
  const hipR = m.torsoWidthBottom * 0.5;
  const pelvisR = hipR * 0.82;

  const samples: Array<[number, number]> = [
    [0.0, pelvisR * 0.35],
    [0.06, pelvisR * 0.75],
    [0.14, hipR],
    [0.26, hipR * 0.98],
    [0.38, waistR * 1.08],
    [0.48, waistR],
    [0.6, waistR * 1.05],
    [0.72, chestR * 0.95],
    [0.84, chestR],
    [0.93, shoulderR * 0.98],
    [0.98, shoulderR * 0.88],
    [1.0, shoulderR * 0.55],
  ];

  return samples.map(([t, r]) => new THREE.Vector2(r, bottomY + t * h));
}

/**
 * Manequim clínico contínuo: tronco orgânico + membros sobrepostos nas juntas.
 * A-pose, silhueta humana — sem gaps entre cápsulas.
 */
export function CodedBody({ type, onPartClick }: CodedBodyProps) {
  const m = useMemo(() => deriveBodyMetrics(type), [type]);
  const torsoPoints = useMemo(() => buildTorsoProfile(m), [m]);

  const layout = useMemo(() => {
    const armOut = (22 * Math.PI) / 180;
    const legOut = (5 * Math.PI) / 180;
    const shoulderDrop = m.H * 0.02;

    const shoulderLX = -m.shoulderHalfWidth * 0.95;
    const shoulderRX = m.shoulderHalfWidth * 0.95;
    const shoulderY = m.shoulderY - shoulderDrop;

    const dirL = new THREE.Vector3(-Math.sin(armOut), -Math.cos(armOut), 0);
    const dirR = new THREE.Vector3(Math.sin(armOut), -Math.cos(armOut), 0);

    const shoulderL = new THREE.Vector3(shoulderLX, shoulderY, 0);
    const elbowL = shoulderL
      .clone()
      .add(dirL.clone().multiplyScalar(m.upperArmLen));
    const wristL = elbowL
      .clone()
      .add(
        new THREE.Vector3(
          -Math.sin(armOut * 0.9),
          -Math.cos(armOut * 0.9),
          0.02
        ).multiplyScalar(m.forearmLen)
      );

    const shoulderR = new THREE.Vector3(shoulderRX, shoulderY, 0);
    const elbowR = shoulderR
      .clone()
      .add(dirR.clone().multiplyScalar(m.upperArmLen));
    const wristR = elbowR
      .clone()
      .add(
        new THREE.Vector3(
          Math.sin(armOut * 0.9),
          -Math.cos(armOut * 0.9),
          0.02
        ).multiplyScalar(m.forearmLen)
      );

    const hipLX = -m.hipHalfWidth * 0.72;
    const hipRX = m.hipHalfWidth * 0.72;
    const hipY = m.crotchY + m.H * 0.14;

    const hipL = new THREE.Vector3(hipLX, hipY, 0);
    const kneeL = new THREE.Vector3(
      hipLX - Math.sin(legOut) * m.thighLen * 0.95,
      m.kneeY,
      0.01
    );
    const ankleL = new THREE.Vector3(
      kneeL.x - Math.sin(legOut * 0.4) * m.calfLen * 0.92,
      m.ankleY,
      0.02
    );

    const hipR = new THREE.Vector3(hipRX, hipY, 0);
    const kneeR = new THREE.Vector3(-kneeL.x, kneeL.y, kneeL.z);
    const ankleR = new THREE.Vector3(-ankleL.x, ankleL.y, ankleL.z);

    return {
      shoulderL,
      elbowL,
      wristL,
      shoulderR,
      elbowR,
      wristR,
      hipL,
      kneeL,
      ankleL,
      hipR,
      kneeR,
      ankleR,
    };
  }, [m]);

  const isChild = type === "child";
  const depthScale = m.torsoDepth / (m.torsoWidthTop * 0.52);

  return (
    <group>
      {/* Cabeça */}
      <SoftSphere
        name="Cabeça"
        position={[0, m.headCenterY, 0]}
        radius={m.headR}
        scale={isChild ? [0.95, 1.08, 0.98] : [0.9, 1.15, 0.95]}
        onPartClick={onPartClick}
      />
      {/* Queixo / transição para o pescoço */}
      <SoftSphere
        name="Cabeça"
        position={[0, m.chinY + m.headR * 0.08, m.headR * 0.12]}
        radius={m.headR * 0.42}
        scale={[0.85, 0.7, 0.9]}
        onPartClick={onPartClick}
      />

      {/* Pescoço — funde cabeça e tronco */}
      <LimbSegment
        name="Pescoço"
        from={new THREE.Vector3(0, m.chinY + m.H * 0.04, 0)}
        to={new THREE.Vector3(0, m.shoulderY + m.H * 0.08, 0)}
        radius={m.neckR}
        overlap={0.2}
        onPartClick={onPartClick}
      />

      {/* Tronco orgânico contínuo */}
      <mesh
        {...getClickProps("Tronco", onPartClick)}
        scale={[1, 1, Math.min(1.15, Math.max(0.75, depthScale))]}
      >
        <latheGeometry args={[torsoPoints, 64]} />
        <SoftMaterial />
      </mesh>

      {/* Ombros fundidos no tronco */}
      <SoftSphere
        name="Ombro esquerdo"
        position={[layout.shoulderL.x, layout.shoulderL.y, 0]}
        radius={m.jointR * 1.25}
        scale={[1.15, 1.05, 1.1]}
        onPartClick={onPartClick}
      />
      <SoftSphere
        name="Ombro direito"
        position={[layout.shoulderR.x, layout.shoulderR.y, 0]}
        radius={m.jointR * 1.25}
        scale={[1.15, 1.05, 1.1]}
        onPartClick={onPartClick}
      />

      {/* Braços — segmentos sobrepostos */}
      <LimbSegment
        name="Braço esquerdo"
        from={layout.shoulderL}
        to={layout.elbowL}
        radius={m.upperArmR}
        overlap={0.18}
        onPartClick={onPartClick}
      />
      <LimbSegment
        name="Braço direito"
        from={layout.shoulderR}
        to={layout.elbowR}
        radius={m.upperArmR}
        overlap={0.18}
        onPartClick={onPartClick}
      />
      <SoftSphere
        name="Cotovelo esquerdo"
        position={layout.elbowL.toArray() as [number, number, number]}
        radius={m.jointR * 0.95}
        onPartClick={onPartClick}
      />
      <SoftSphere
        name="Cotovelo direito"
        position={layout.elbowR.toArray() as [number, number, number]}
        radius={m.jointR * 0.95}
        onPartClick={onPartClick}
      />
      <LimbSegment
        name="Antebraço esquerdo"
        from={layout.elbowL}
        to={layout.wristL}
        radius={m.forearmR}
        overlap={0.18}
        onPartClick={onPartClick}
      />
      <LimbSegment
        name="Antebraço direito"
        from={layout.elbowR}
        to={layout.wristR}
        radius={m.forearmR}
        overlap={0.18}
        onPartClick={onPartClick}
      />

      {/* Mãos */}
      <SoftSphere
        name="Mão esquerda"
        position={layout.wristL.toArray() as [number, number, number]}
        radius={m.handR}
        scale={[0.65, 1.2, 0.4]}
        onPartClick={onPartClick}
      />
      <SoftSphere
        name="Mão direita"
        position={layout.wristR.toArray() as [number, number, number]}
        radius={m.handR}
        scale={[0.65, 1.2, 0.4]}
        onPartClick={onPartClick}
      />

      {/* Quadris + pernas contínuas */}
      <SoftSphere
        name="Quadril esquerdo"
        position={layout.hipL.toArray() as [number, number, number]}
        radius={m.jointR * 1.35}
        scale={[1.2, 1.1, 1.15]}
        onPartClick={onPartClick}
      />
      <SoftSphere
        name="Quadril direito"
        position={layout.hipR.toArray() as [number, number, number]}
        radius={m.jointR * 1.35}
        scale={[1.2, 1.1, 1.15]}
        onPartClick={onPartClick}
      />

      <LimbSegment
        name="Coxa esquerda"
        from={layout.hipL}
        to={layout.kneeL}
        radius={m.thighR}
        overlap={0.16}
        onPartClick={onPartClick}
      />
      <LimbSegment
        name="Coxa direita"
        from={layout.hipR}
        to={layout.kneeR}
        radius={m.thighR}
        overlap={0.16}
        onPartClick={onPartClick}
      />
      <SoftSphere
        name="Joelho esquerdo"
        position={layout.kneeL.toArray() as [number, number, number]}
        radius={m.jointR * 1.05}
        onPartClick={onPartClick}
      />
      <SoftSphere
        name="Joelho direito"
        position={layout.kneeR.toArray() as [number, number, number]}
        radius={m.jointR * 1.05}
        onPartClick={onPartClick}
      />
      <LimbSegment
        name="Panturrilha esquerda"
        from={layout.kneeL}
        to={layout.ankleL}
        radius={m.calfR}
        overlap={0.16}
        onPartClick={onPartClick}
      />
      <LimbSegment
        name="Panturrilha direita"
        from={layout.kneeR}
        to={layout.ankleR}
        radius={m.calfR}
        overlap={0.16}
        onPartClick={onPartClick}
      />

      {/* Pés */}
      <mesh
        {...getClickProps("Pé esquerdo", onPartClick)}
        position={[
          layout.ankleL.x,
          m.footR * 0.45,
          layout.ankleL.z + m.footLen * 0.28,
        ]}
        rotation={[0.12, 0, 0]}
        scale={[0.85, 0.45, 1.15]}
      >
        <capsuleGeometry args={[m.footR, m.footLen * 0.45, 8, 16]} />
        <SoftMaterial />
      </mesh>
      <mesh
        {...getClickProps("Pé direito", onPartClick)}
        position={[
          layout.ankleR.x,
          m.footR * 0.45,
          layout.ankleR.z + m.footLen * 0.28,
        ]}
        rotation={[0.12, 0, 0]}
        scale={[0.85, 0.45, 1.15]}
      >
        <capsuleGeometry args={[m.footR, m.footLen * 0.45, 8, 16]} />
        <SoftMaterial />
      </mesh>
    </group>
  );
}

import { Box, Cylinder, Image } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import {
    RapierRigidBody,
    RigidBody,
    useRevoluteJoint,
    Vector3Array,
} from "@react-three/rapier";
import { createRef, RefObject, useRef } from "react";
import { Demo } from "../../App";
import { ControlRes, useControls } from "./utils/useControls";
import { MAP_ASP, MAP_SCALE, useHookmaMap } from "./utils/useHookmaMap";
import * as THREE from "three";

const WHEEL_VEL = 15;
const WHEEL_FAC = 100;
const WheelJoint = ({
    body,
    wheel,
    bodyAnchor,
    wheelAnchor,
    rotationAxis,
    controls,
    side,
}: {
    body: RefObject<RapierRigidBody>;
    wheel: RefObject<RapierRigidBody>;
    bodyAnchor: Vector3Array;
    wheelAnchor: Vector3Array;
    rotationAxis: Vector3Array;
    controls: RefObject<ControlRes>;
    side: "left" | "right";
}) => {
    const joint = useRevoluteJoint(body, wheel, [
        bodyAnchor,
        wheelAnchor,
        rotationAxis,
    ]);

    useFrame(() => {
        if (joint.current && controls.current) {
            joint.current.configureMotorVelocity(
                controls.current[side] * WHEEL_VEL,
                WHEEL_FAC
            );
        }
    });

    return null;
};

export const Car: Demo = () => {
    const bodyRef = useRef<RapierRigidBody>(null);
    const wheelPositions: [number, number, number][] = [
        [3, -1, 3],
        [3, -1, -3],
    ];
    const sensorPositions: [number, number, number][] = [
        [-2.5, 2, 0],
        [1, 0, 1],
        [2, 0, 0],
        [1, 0, -1],
    ];
    const indexSides = ["left", "right"] as const;
    const floatyBoxesRef = useRef(
        sensorPositions.map(() => createRef<THREE.Mesh>())
    );
    const floatBoxesColorRef = useRef(
        sensorPositions.map(() => createRef<THREE.MeshPhysicalMaterial>())
    );
    const wheelRefs = useRef(
        wheelPositions.map(() => createRef<RapierRigidBody>())
    );
    const STUPID_VEC = new THREE.Vector3();
    const [canvasRef] = useHookmaMap(floatyBoxesRef);
    const kb = useControls(canvasRef.current);
    useFrame(() => {
        const parentBox = floatyBoxesRef.current[0].current;
        if (!floatBoxesColorRef.current || !bodyRef.current || !parentBox)
            return;
        for (let i = 0; i < floatBoxesColorRef.current.length; i++) {
            if (canvasRef.current.color[i]) {
                const rgb = canvasRef.current.color[i];
                const [r, g, b] = [...rgb].map((x) => x / 255);
                floatBoxesColorRef.current[i].current?.color.setRGB(r, g, b);
            }
        }
        if (canvasRef.current.color[0] && kb.current.sample) {
            const [r, g, b] = canvasRef.current.color[0];
            console.log(r, g, b);
            console.log(canvasRef.current.color);
            for (let i = 0; i < floatyBoxesRef.current.length; i++) {
                console.log(i);
                const floatyBox = floatyBoxesRef.current[i];
                console.log(floatyBox.current?.getWorldPosition(STUPID_VEC));
                const vector = canvasRef.current.vectors[i];
                console.log(vector);
            }
        }
    });
    return (
        <>
            <group position={[-38, -3, 10]} rotation={[0, -Math.PI / 1.5, 0]}>
                <RigidBody
                    colliders="cuboid"
                    ref={bodyRef}
                    type="dynamic"
                    canSleep={false}
                    friction={0}
                >
                    <Box
                        ref={floatyBoxesRef.current[0]}
                        position={sensorPositions[0]}
                    >
                        <meshPhysicalMaterial
                            color={"red"}
                            metalness={1}
                            reflectivity={0}
                            ref={floatBoxesColorRef.current[0]}
                        />
                        {floatyBoxesRef.current.slice(1).map((ref, index) => (
                            <Box
                                ref={ref}
                                key={index + 1}
                                position={sensorPositions[index + 1]}
                            >
                                <meshPhysicalMaterial
                                    color={"red"}
                                    metalness={1}
                                    reflectivity={0}
                                    ref={floatBoxesColorRef.current[index + 1]}
                                />
                            </Box>
                        ))}
                    </Box>
                    <Box
                        scale={[6.5, 1, 4]}
                        castShadow
                        receiveShadow
                        name="chassis"
                    >
                        <meshStandardMaterial color={"red"} />
                    </Box>
                </RigidBody>
                {wheelPositions.map((wheelPosition, index) => (
                    <RigidBody
                        position={wheelPosition}
                        colliders="hull"
                        type="dynamic"
                        key={index}
                        ref={wheelRefs.current[index]}
                        friction={2}
                    >
                        <Cylinder
                            rotation={[Math.PI / 2, 0, 0]}
                            args={[1, 1, 1, 32]}
                            castShadow
                            receiveShadow
                        >
                            <meshStandardMaterial color={"grey"} />
                        </Cylinder>
                    </RigidBody>
                ))}
                {wheelPositions.map((wheelPosition, index) => (
                    <WheelJoint
                        key={index}
                        body={bodyRef}
                        wheel={wheelRefs.current[index]}
                        bodyAnchor={wheelPosition}
                        wheelAnchor={[0, 0, 0]}
                        rotationAxis={[0, 0, 1]}
                        controls={kb}
                        side={indexSides[index]}
                    />
                ))}
            </group>
            <Map map_url="map.png" />
        </>
    );
};

const Map = ({ map_url }: { map_url: string }) => {
    return (
        <Image
            position={[0, -7.1, 0]}
            scale={[MAP_SCALE * MAP_ASP, MAP_SCALE]}
            rotation={[-Math.PI / 2, 0, 0]}
            url={map_url}
        />
    );
};

// car city carpet 😎
// const MAP_SCALE = 100;
// const MAP_ASP = 0.833;
// function Map() {
//     return (
//         <>
//             <Image
//                 position={[0, -7.1, 0]}
//                 scale={[MAP_SCALE * MAP_ASP, MAP_SCALE]}
//                 rotation={[-Math.PI / 2, 0, 0]}
//                 url="car-city.jpeg"
//             />
//         </>
//     );
// }

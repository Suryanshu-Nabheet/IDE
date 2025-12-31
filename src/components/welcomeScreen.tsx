import * as ss from '../features/settings/settingsSlice'
import { useAppDispatch } from '../app/hooks'
import React, { useEffect, useState } from 'react'
import { RadioGroup } from '@headlessui/react'
import { dismissWelcome } from '../features/tools/toolSlice'
import posthog from 'posthog-js'

export default function ButtonGroup({
    plans,
    onClick,
}: {
    plans: { name: string }[]
    onClick: any
}) {
    const [selected, setSelected] = useState(plans[0])

    useEffect(() => {
        onClick(selected)
    }, [selected, onClick])

    return (
        <div className="w-full">
            <div className="">
                <RadioGroup
                    value={selected}
                    onChange={(plan: { name: string; keybinding: string }) => {
                        setSelected(plan)
                    }}
                >
                    <RadioGroup.Label className="sr-only">
                        Server size
                    </RadioGroup.Label>
                    <div className="">
                        {plans.map((plan) => (
                            <div className="inline-block" key={plan.name}>
                                <RadioGroup.Option
                                    key={plan.name}
                                    value={plan}
                                    className={({ active: _active, checked }) =>
                                        `
                                  ${checked ? 'checked-welcome-radio' : ''}
                                    relative flex welcome-radio cursor-pointer rounded-md px-3 py-3 welcome-radio-butotn mr-2 shadow-md outline-none`
                                    }
                                >
                                    {({ active: _active, checked }) => (
                                        <>
                                            <div className="flex items-center justify-between w-32">
                                                <div className="flex items-center mr-2">
                                                    <div className="text-sm">
                                                        <RadioGroup.Label
                                                            as="p"
                                                            className={`font-medium`}
                                                        >
                                                            {plan.name}
                                                        </RadioGroup.Label>
                                                    </div>
                                                </div>
                                                {checked && (
                                                    <div className="shrink-0 text-white">
                                                        <CheckIcon className="h-6 w-6" />
                                                    </div>
                                                )}
                                            </div>
                                        </>
                                    )}
                                </RadioGroup.Option>
                            </div>
                        ))}
                    </div>
                </RadioGroup>
            </div>
        </div>
    )
}

function CheckIcon(
    props: JSX.IntrinsicAttributes & React.SVGProps<SVGSVGElement>
) {
    return (
        <svg viewBox="0 0 24 24" fill="none" {...props}>
            <circle cx={12} cy={12} r={12} fill="#fff" opacity="0.2" />
            <path
                d="M7 13l3 3 7-7"
                stroke="#fff"
                strokeWidth={1.5}
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    )
}

const keyOptions = [
    {
        name: 'Default',
        keybinding: 'none',
    },
    {
        name: 'Vim',
        keybinding: 'vim',
    },
    {
        name: 'Emacs',
        keybinding: 'emacs',
    },
]

export function WelcomeScreen() {
    const dispatch = useAppDispatch()

    useEffect(() => {
        posthog.capture('Welcome Screen')
    }, [])

    return (
        <div className="welcome-screen-container">
            <div className="welcome-screen-inner">
                <h1 className="welcome-screen-title">Welcome to CodeX</h1>
                <div className="key-bindings-section section">
                    <h2 className="key-bindings-title title">Key Bindings</h2>
                    <p className="key-bindings-subheading subheading">
                        Choose your preferred key binding style for the editor.
                    </p>
                    <ButtonGroup
                        plans={keyOptions}
                        onClick={(plan: any) => {
                            dispatch(
                                ss.changeSettings({
                                    keyBindings: plan.keybinding,
                                })
                            )
                        }}
                    />
                </div>
                <div className="done-button-section">
                    <button
                        className="done-button welcome-button"
                        onClick={() => {
                            posthog.capture('Welcome Screen Continue')
                            dispatch(dismissWelcome())
                        }}
                    >
                        Continue
                    </button>
                </div>
            </div>
        </div>
    )
}

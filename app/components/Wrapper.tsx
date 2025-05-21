import React from 'react'

type WrapperProps = {
    children: React.ReactNode
}

const Wrapper = ({ children }: WrapperProps) => {
    return (
        <div>
            <div className='px-5 md:px-[10%] mt-8 mb-10'>
                {children}
            </div>
        </div>
    )
}

export default Wrapper

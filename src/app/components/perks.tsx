interface PerksProps {
    selected: string[];
    onChange: (selected: string[]) => void;
}

export default function Perks({ selected = [], onChange }: PerksProps) {
    const perksList = [
        'Wifi', 
        'Free parking spot', 
        'TV', 
        'Pet', 
        'Private Entrance', 
        'Radio'
    ];

    const handleCheckboxChange = (perk: string) => {
        if (selected.includes(perk)) {
            onChange(selected.filter(item => item !== perk)); // Remove perk if already selected
        } else {
            onChange([...selected, perk]); // Add perk if not selected
        }
    };

    return (
        <>
            <h2>Perks</h2>
            <p>Select all the perks of your place</p>
            <div className='grid gap-2 grid-cols-3 md:grid-cols-3 lg:grid-cols-6'>
                {perksList.map(perk => (
                    <label key={perk} className='border p-4 gap-2 flex rounded-2xl items-center'>
                        <input
                            type="checkbox"
                            checked={selected.includes(perk)}
                            onChange={() => handleCheckboxChange(perk)}
                        />
                        <span>{perk}</span>
                    </label>
                ))}
            </div>
        </>
    );
}
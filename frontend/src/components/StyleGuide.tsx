import React from 'react';
import { Button } from './Button';
import { Input } from './Input';
import { Tag } from './Tag';
import { Card } from './Card';
import { Rating } from './Rating';
import { Check, X, Info, AlertTriangle } from 'lucide-react';

export function StyleGuide() {
  return (
    <div className="min-h-screen bg-[#F5F5F5] p-8">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Header */}
        <div>
          <h1 className="display-lg mb-2">ArenaBook Design System</h1>
          <p className="body-l text-[#4D4D4D]">Спорт алаңдарын брондау платформасының дизайн жүйесі</p>
        </div>
        
        {/* Colors */}
        <section>
          <h2 className="mb-6">Түстер / Colors</h2>
          <Card>
            <div className="space-y-6">
              {/* Primary */}
              <div>
                <h4 className="mb-3">Primary</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <div className="h-24 rounded-lg bg-[#2ECC71] mb-2"></div>
                    <p className="body-s">Primary 500</p>
                    <p className="caption-r text-[#808080]">#2ECC71</p>
                  </div>
                  <div>
                    <div className="h-24 rounded-lg bg-[#27AE60] mb-2"></div>
                    <p className="body-s">Primary 600</p>
                    <p className="caption-r text-[#808080]">#27AE60</p>
                  </div>
                  <div>
                    <div className="h-24 rounded-lg bg-[#EAFBF3] mb-2 border border-[#D9D9D9]"></div>
                    <p className="body-s">Primary 100</p>
                    <p className="caption-r text-[#808080]">#EAFBF3</p>
                  </div>
                </div>
              </div>
              
              {/* Gray Scale */}
              <div>
                <h4 className="mb-3">Neutral / Gray</h4>
                <div className="grid grid-cols-6 gap-4">
                  {[
                    { name: 'Gray 900', hex: '#1A1A1A' },
                    { name: 'Gray 700', hex: '#4D4D4D' },
                    { name: 'Gray 500', hex: '#808080' },
                    { name: 'Gray 300', hex: '#D9D9D9' },
                    { name: 'Gray 100', hex: '#F5F5F5' },
                    { name: 'White', hex: '#FFFFFF' }
                  ].map((color) => (
                    <div key={color.name}>
                      <div 
                        className="h-20 rounded-lg mb-2 border border-[#D9D9D9]" 
                        style={{ backgroundColor: color.hex }}
                      ></div>
                      <p className="body-s">{color.name}</p>
                      <p className="caption-r text-[#808080]">{color.hex}</p>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Semantic */}
              <div>
                <h4 className="mb-3">Semantic</h4>
                <div className="grid grid-cols-4 gap-4">
                  {[
                    { name: 'Success', hex: '#2ECC71' },
                    { name: 'Warning', hex: '#F1C40F' },
                    { name: 'Error', hex: '#E74C3C' },
                    { name: 'Info', hex: '#3498DB' }
                  ].map((color) => (
                    <div key={color.name}>
                      <div 
                        className="h-20 rounded-lg mb-2" 
                        style={{ backgroundColor: color.hex }}
                      ></div>
                      <p className="body-s">{color.name}</p>
                      <p className="caption-r text-[#808080]">{color.hex}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </section>
        
        {/* Typography */}
        <section>
          <h2 className="mb-6">Типографика / Typography</h2>
          <Card>
            <div className="space-y-6">
              <div>
                <p className="caption-r text-[#808080] mb-2">Display XL - 48px / Bold</p>
                <div className="display-xl">Спорт алаңдары</div>
              </div>
              <div>
                <p className="caption-r text-[#808080] mb-2">Display LG - 36px / Bold</p>
                <div className="display-lg">Спорт алаңдары</div>
              </div>
              <div>
                <p className="caption-r text-[#808080] mb-2">H1 - 28px / Bold</p>
                <h1>Спорт алаңдары</h1>
              </div>
              <div>
                <p className="caption-r text-[#808080] mb-2">H2 - 24px / Semibold</p>
                <h2>Спорт алаңдары</h2>
              </div>
              <div>
                <p className="caption-r text-[#808080] mb-2">H3 - 20px / Semibold</p>
                <h3>Спорт алаңдары</h3>
              </div>
              <div>
                <p className="caption-r text-[#808080] mb-2">H4 - 18px / Semibold</p>
                <h4>Спорт алаңдары</h4>
              </div>
              <div>
                <p className="caption-r text-[#808080] mb-2">Body L - 16px / Medium</p>
                <p className="body-l">Қазақстандағы ең үздік спорт алаңдарын табыңыз</p>
              </div>
              <div>
                <p className="caption-r text-[#808080] mb-2">Body R - 16px / Regular</p>
                <p className="body-r">Қазақстандағы ең үздік спорт алаңдарын табыңыз</p>
              </div>
              <div>
                <p className="caption-r text-[#808080] mb-2">Body S - 14px / Regular</p>
                <p className="body-s">Қазақстандағы ең үздік спорт алаңдарын табыңыз</p>
              </div>
              <div>
                <p className="caption-r text-[#808080] mb-2">Caption - 12px / Regular</p>
                <p className="caption-r">Қазақстандағы ең үздік спорт алаңдарын табыңыз</p>
              </div>
            </div>
          </Card>
        </section>
        
        {/* Buttons */}
        <section>
          <h2 className="mb-6">Батырмалар / Buttons</h2>
          <Card>
            <div className="space-y-8">
              <div>
                <h4 className="mb-4">Sizes</h4>
                <div className="flex flex-wrap gap-4 items-center">
                  <Button variant="primary" size="sm">Small Button</Button>
                  <Button variant="primary" size="md">Medium Button</Button>
                  <Button variant="primary" size="lg">Large Button</Button>
                </div>
              </div>
              
              <div>
                <h4 className="mb-4">Variants</h4>
                <div className="flex flex-wrap gap-4">
                  <Button variant="primary">Primary</Button>
                  <Button variant="secondary">Secondary</Button>
                  <Button variant="ghost">Ghost</Button>
                  <Button variant="destructive">Destructive</Button>
                  <Button variant="primary" disabled>Disabled</Button>
                </div>
              </div>
            </div>
          </Card>
        </section>
        
        {/* Inputs */}
        <section>
          <h2 className="mb-6">Енгізу өрістері / Inputs</h2>
          <Card>
            <div className="space-y-4 max-w-md">
              <Input label="Аты" placeholder="Атыңызды енгізіңіз" />
              <Input label="Email" type="email" placeholder="email@example.com" />
              <Input label="Қате мысалы" error="Бұл өріс міндетті" placeholder="Мәтін енгізіңіз" />
            </div>
          </Card>
        </section>
        
        {/* Tags */}
        <section>
          <h2 className="mb-6">Тегтер / Tags</h2>
          <Card>
            <div className="flex flex-wrap gap-3">
              <Tag variant="default">Default</Tag>
              <Tag variant="success">Success</Tag>
              <Tag variant="warning">Warning</Tag>
              <Tag variant="error">Error</Tag>
              <Tag variant="info">Info</Tag>
            </div>
          </Card>
        </section>
        
        {/* Rating */}
        <section>
          <h2 className="mb-6">Рейтинг / Rating</h2>
          <Card>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Rating value={5} />
                <span className="body-s text-[#4D4D4D]">5.0</span>
              </div>
              <div className="flex items-center gap-4">
                <Rating value={4.5} />
                <span className="body-s text-[#4D4D4D]">4.5</span>
              </div>
              <div className="flex items-center gap-4">
                <Rating value={3} />
                <span className="body-s text-[#4D4D4D]">3.0</span>
              </div>
            </div>
          </Card>
        </section>
        
        {/* Spacing */}
        <section>
          <h2 className="mb-6">Аралық / Spacing</h2>
          <Card>
            <div className="space-y-4">
              {[
                { name: 'Space 4', value: '4px' },
                { name: 'Space 8', value: '8px' },
                { name: 'Space 12', value: '12px' },
                { name: 'Space 16', value: '16px' },
                { name: 'Space 20', value: '20px' },
                { name: 'Space 24', value: '24px' },
                { name: 'Space 32', value: '32px' },
                { name: 'Space 40', value: '40px' }
              ].map((space) => (
                <div key={space.name} className="flex items-center gap-4">
                  <div className="w-32">
                    <p className="body-s">{space.name}</p>
                    <p className="caption-r text-[#808080]">{space.value}</p>
                  </div>
                  <div 
                    className="h-8 bg-[#2ECC71] rounded" 
                    style={{ width: space.value }}
                  ></div>
                </div>
              ))}
            </div>
          </Card>
        </section>
        
        {/* Shadows */}
        <section>
          <h2 className="mb-6">Көлеңкелер / Shadows</h2>
          <div className="grid grid-cols-2 gap-6">
            <Card className="h-32">
              <h4 className="mb-2">Shadow 1</h4>
              <p className="caption-r text-[#808080]">0px 2px 6px rgba(0,0,0,0.08)</p>
            </Card>
            <div className="bg-white rounded-xl p-6 h-32 shadow-[0px_4px_12px_rgba(0,0,0,0.12)]">
              <h4 className="mb-2">Shadow 2</h4>
              <p className="caption-r text-[#808080]">0px 4px 12px rgba(0,0,0,0.12)</p>
            </div>
          </div>
        </section>
        
        {/* Border Radius */}
        <section>
          <h2 className="mb-6">Бұрыш радиусы / Border Radius</h2>
          <Card>
            <div className="grid grid-cols-4 gap-6">
              <div>
                <div className="h-24 bg-[#EAFBF3] rounded mb-2" style={{ borderRadius: '4px' }}></div>
                <p className="body-s">4px - inputs</p>
              </div>
              <div>
                <div className="h-24 bg-[#EAFBF3] rounded-lg mb-2"></div>
                <p className="body-s">8px - cards</p>
              </div>
              <div>
                <div className="h-24 bg-[#EAFBF3] rounded-xl mb-2"></div>
                <p className="body-s">12px - dialogs</p>
              </div>
              <div>
                <div className="h-12 bg-[#EAFBF3] rounded-full mb-2"></div>
                <p className="body-s">100px - pills</p>
              </div>
            </div>
          </Card>
        </section>
      </div>
    </div>
  );
}

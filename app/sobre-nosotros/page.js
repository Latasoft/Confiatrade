'use client'

import { useState } from 'react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/ui/Footer'

export default function SobreNosotrosPage() {
  return (
    <div className="bg-gradient-to-br from-green-50 via-blue-50 to-yellow-50 min-h-screen">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-800 mb-4">
              Sobre ConfiaTrade
            </h1>
            <p className="text-gray-600 text-lg max-w-3xl mx-auto">
              Somos la plataforma líder en comercio agrícola y logística, conectando productores, 
              transportistas y compradores en un ecosistema confiable y eficiente.
            </p>
          </div>

          {/* Misión, Visión y Valores */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <div className="text-center bg-white p-6 rounded-lg shadow-md">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-green-600 text-2xl">🎯</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">Misión</h3>
              <p className="text-gray-600">
                Facilitar el comercio agrícola y la logística mediante una plataforma segura 
                que conecte a todos los actores de la cadena de suministro.
              </p>
            </div>

            <div className="text-center bg-white p-6 rounded-lg shadow-md">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-blue-600 text-2xl">👁️</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">Visión</h3>
              <p className="text-gray-600">
                Ser la plataforma de referencia para el comercio agrícola en América Latina, 
                promoviendo la transparencia y eficiencia en cada transacción.
              </p>
            </div>

            <div className="text-center bg-white p-6 rounded-lg shadow-md">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-yellow-600 text-2xl">⭐</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">Valores</h3>
              <p className="text-gray-600">
                Transparencia, confianza, innovación y compromiso con el desarrollo 
                sostenible del sector agrícola.
              </p>
            </div>
          </div>

          {/* Historia */}
          <div className="bg-green-50 rounded-lg p-8 mb-16">
            <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
              Nuestra Historia
            </h2>
            <div className="max-w-4xl mx-auto">
              <p className="text-gray-700 text-lg mb-6">
                ConfiaTrade nació en 2020 con la visión de transformar el comercio agrícola en América Latina. 
                Fundada por un equipo de profesionales con experiencia en agricultura, tecnología y logística, 
                nuestra plataforma surge de la necesidad de crear un espacio confiable y eficiente para el 
                intercambio comercial.
              </p>
              <p className="text-gray-700 text-lg mb-6">
                Desde nuestros inicios, hemos facilitado miles de transacciones exitosas, conectando productores 
                de Argentina, Chile, Brasil y otros países de la región con compradores y transportistas 
                especializados.
              </p>
              <p className="text-gray-700 text-lg">
                Hoy en día, ConfiaTrade es reconocida como una plataforma innovadora que ha revolucionado 
                la forma en que se realizan los negocios agrícolas, ofreciendo transparencia, seguridad 
                y eficiencia en cada transacción.
              </p>
            </div>
          </div>

          {/* Estadísticas */}
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-800 mb-8">
              ConfiaTrade en Números
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="text-3xl font-bold text-green-600 mb-2">10,000+</div>
                <div className="text-gray-600">Transacciones Exitosas</div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="text-3xl font-bold text-blue-600 mb-2">5,000+</div>
                <div className="text-gray-600">Usuarios Registrados</div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="text-3xl font-bold text-yellow-600 mb-2">15</div>
                <div className="text-gray-600">Países Conectados</div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="text-3xl font-bold text-purple-600 mb-2">$50M+</div>
                <div className="text-gray-600">Volumen de Comercio</div>
              </div>
            </div>
          </div>

          {/* Equipo */}
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-800 mb-8">
              Nuestro Equipo
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-4"></div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Diego Martínez</h3>
                <p className="text-green-600 mb-2">CEO & Fundador</p>
                <p className="text-gray-600 text-sm">
                  Ingeniero Agrónomo con 15 años de experiencia en el sector.
                </p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-4"></div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Ana García</h3>
                <p className="text-green-600 mb-2">CTO</p>
                <p className="text-gray-600 text-sm">
                  Experta en tecnología con especialización en plataformas digitales.
                </p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-4"></div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Carlos Rodríguez</h3>
                <p className="text-green-600 mb-2">Director de Operaciones</p>
                <p className="text-gray-600 text-sm">
                  Especialista en logística y cadena de suministro agrícola.
                </p>
              </div>
            </div>
          </div>

          {/* Compromiso */}
          <div className="bg-blue-50 rounded-lg p-8 text-center">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">
              Nuestro Compromiso
            </h2>
            <p className="text-gray-700 text-lg max-w-3xl mx-auto mb-6">
              En ConfiaTrade, estamos comprometidos con el desarrollo sostenible del sector agrícola. 
              Trabajamos continuamente para mejorar nuestra plataforma, ofreciendo herramientas 
              innovadoras que faciliten el comercio justo y transparente.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <div className="text-center">
                <div className="text-blue-800 font-semibold mb-2">🌱 Sostenibilidad</div>
                <div className="text-blue-600 text-sm">Promovemos prácticas agrícolas sostenibles</div>
              </div>
              <div className="text-center">
                <div className="text-blue-800 font-semibold mb-2">🤝 Confianza</div>
                <div className="text-blue-600 text-sm">Construimos relaciones duraderas y confiables</div>
              </div>
              <div className="text-center">
                <div className="text-blue-800 font-semibold mb-2">🚀 Innovación</div>
                <div className="text-blue-600 text-sm">Innovamos constantemente para mejorar</div>
              </div>
            </div>
          </div>
      </div>
      <Footer />
    </div>
  )
}